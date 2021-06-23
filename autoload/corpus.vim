" Copyright 2015-present Greg Hurrell. All rights reserved.
" Licensed under the terms of the MIT license.

if !has('nvim')
  finish
endif

lua require 'corpus'

let s:chooser_buffer=v:null
let s:chooser_selected_index=v:null
let s:chooser_window=v:null

let s:preview_buffer=v:null
let s:preview_window=v:null
function! corpus#buf_new_file() abort
  let l:file=v:lua.corpus.normalize('<afile>')
  call v:lua.corpus.metadata.update(l:file)
  let b:corpus_new_file=1
endfunction

function! corpus#buf_write_post() abort
  let l:file=v:lua.corpus.normalize('<afile>')
  if has_key(b:, 'corpus_new_file')
    unlet b:corpus_new_file
    let l:operation='create'
  else
    let l:operation='update'
  endif
  call v:lua.corpus.commit(l:file, l:operation)
endfunction

function! corpus#buf_write_pre() abort
  let l:file=v:lua.corpus.normalize('<afile>')
  call corpus#update_references(l:file)
  call v:lua.corpus.metadata.update(l:file)
endfunction

" Minimal subset of:
"
" https://spec.commonmark.org/0.29/#link-reference-definition
function! corpus#extract_link_reference_definition(line) abort
  let l:match=matchlist(a:line, '\v^ {0,3}\[(\s*\S.*)\]:\s*(.+)')
  if len(l:match)
    " TODO: validate innards
    return [l:match[1], l:match[2]]
  else
    return []
  endif
endfunction

" Loose parsing of reference links. Of the three types, we only look for
" shortcut reference links:
"
" - Full reference link [text][id]
" - Collapsed reference link [id][]
" - Shortcut reference link [id]
"
" See: https://spec.commonmark.org/0.29/#reference-link
function! corpus#extract_reference_links(line) abort
  let l:start=0
  let l:max=len(a:line)

  let l:reference_links=[]

  while l:start < l:max
    " Negative lookbehind (@<!): any [ or ` not preceded by a backslash.
    let l:index=match(a:line, '\v\\@<!(`|[)', l:start)
    if a:line[l:index] == '['
      " May be a link.
      let l:end=match(a:line, '\v\\@<!]', l:index)

      if l:end == -1
        " No end marker found; we're done.
        break
      else
        let l:id = strpart(a:line, l:index + 1, l:end - l:index - 2)
        " Exclude stuff that we know can't be in a file name.
        " eg. [this ~is~ *obviously* `not` a file name]
        if match(l:id, '\v^[ A-Za-z0-9-]+$') == 0
          " Look ahead to be sure this isn't a normal link.
          let l:next=a:line[l:end + 1]
          if l:next != '[' && l:next != '('
            call add(l:reference_links, strpart(a:line, l:index + 1, l:end - l:index - 1))
          endif
        endif

        " (Hopefully rare) gotcha here, if we skip over a normal link
        " that contains something like "[foo]" in its link target we
        " will get a false positive.
        let l:start=l:end + 1
      endif
    elseif a:line[l:index] == '`'
      " May be a code span: https://spec.commonmark.org/0.29/#code-spans
      let l:backticks=matchstr(a:line, '\v`+', l:index)

      " Again, negative lookbehind to find matching run of backticks not preceded
      " by a slash.
      let l:end=match(a:line, '\v\\@<!`{' . len(l:backticks) . '}', l:index + 1)

      if l:end == -1
        " No end marker found; not a code span.
        let l:start=l:index + len(l:backticks)
      else
        " Skip past end marker.
        let l:start=l:end + len(l:backticks)
      endif
    else
      " No unescaped [ or ` found.
      break
    endif
  endwhile

  return l:reference_links
endfunction

function! corpus#goto(mode) abort
  if a:mode == 'v'
    " Visual mode.
    let l:start=getpos("'<")
    let l:end=getpos("'>")
    if l:start[1] != l:end[1]
      " We don't support multiline selections.
      return
    endif

    if l:end[2] == 2147483647
      " This is a visual line selection.
      return
    endif

    let l:line=getline(l:start[1])
    let l:len=len(l:line)
    let l:start=l:start[2] -1
    let l:end=l:end[2] - 1

    if l:end - l:start == 0
      " Edge case: empty selection.
      return
    endif

    let l:words=strpart(l:line, l:start, l:end - l:start + 1)
    let l:prefix=strpart(l:line, 0, l:start)
    let l:suffix=strpart(l:line, l:end + 1, l:len - l:end)
    let l:linkified=l:prefix . '[' . l:words . ']' . l:suffix
    call setline(line('.'), l:linkified)
    call cursor(0, l:end + 3)
    return
  endif

  " Normal mode.
  let l:pos=getpos('.')
  " Note that `l:col` is 1-based, so we tweak it to be 0-based.
  let l:col=l:pos[2] - 1
  let l:line=getline(l:pos[1])
  let l:len=len(l:line)

  " Find preceding [.
  if l:line[l:col] == '['
    " Already on [.
    let l:start=l:col + 1
  else
    let l:start=l:col - 1
    while l:start >= 0
      if l:line[l:start] == ']'
        " Hit a prior link: bail.
        let l:start=-1
        break
      elseif l:line[l:start] == '['
        let l:start=l:start + 1
        break
      endif
      let l:start=l:start - 1
    endwhile
  endif

  " Find following ].
  if l:line[l:col] == ']'
    " Already on ].
    let l:end=l:col - 1
  else
    let l:end=l:col + 1
    while l:end <= l:len
      if l:line[l:end] == '['
        " Hit a following link: bail.
        let l:end=l:len + 1
        break
      elseif l:line[l:end] == ']'
        let l:end=l:end - 1
        break
      endif
      let l:end=l:end + 1
    endwhile
  endif

  " Special case: do nothing if cursor on empty link ([]).
  if l:end - l:start < 0
    return
  endif

  let l:config=v:lua.corpus.config_for_file(expand('%:p'))
  let l:transform=get(l:config, 'transform', 'local')
  if l:start > 0 && l:end < l:len
    let l:name=strpart(l:line, l:start, l:end - l:start + 1)
    if l:transform == 'web'
      let l:name=substitute(l:name, '_', ' ', 'g')
    endif
    let l:target=l:config.location . '/' . l:name . '.md'

    " Check for case differences of first letter, so that we can coerce if
    " necessary.
    let l:matches=glob(
          \   l:config.location .
          \   '/[' .
          \   tolower(l:name[0]) .
          \   toupper(l:name[0]) .
          \   ']' .
          \   strpart(l:name, 1, len(l:name) - 1) .
          \   '.md'
          \   ,
          \   0,
          \   1
          \ )

    if index(matches, l:target) != -1
      " Perfect match, leave it as-is.
    elseif len(matches) == 1
      " Found near match, differing only by case: use that.
      let l:target=matches[0]
    else
      " File doesn't exist yet: will let Vim create it as-is.
    endif

    execute 'edit ' . fnameescape(l:target)
  else
    " No link target found. Assume current word should be made into a link.
    if l:line[l:col] == ' '
      " Edge case: if cursor is between two words, do nothing.
    else
      let l:start=match(strpart(l:line, 0, l:col), '\v\w*$')
      let l:end=match(l:line, '\v>', l:col)
      let l:word=strpart(l:line, l:start, l:end - l:start)
      let l:prefix=strpart(l:line, 0, l:start)
      let l:suffix=strpart(l:line, l:end, l:len - l:end - 1)
      let l:linkified=l:prefix . '[' . l:word . ']' . l:suffix
      call setline(line('.'), l:linkified)
      call cursor(0, l:col + 2)
    endif
  endif
endfunction

function! corpus#test() abort
  let v:errors=[]

  " Find all the functions in corpus/test.vim and call them.
  for l:candidate in split(&rtp, ',')
    let l:source=join([l:candidate, 'autoload', 'corpus', 'test.vim'], '/')
    if filereadable(l:source)
      let l:lines=readfile(l:source)
      for l:line in l:lines
        let l:match=matchlist(l:line, '\v^function! (corpus#test#[a-z_]+)\(\)')
        if len(l:match)
          execute 'call ' . match[1] . '()'
        endif
      endfor
      break
    endif
  endfor

  if len(v:errors)
    echoerr 'Errors: ' . len(v:errors) . '; please see v:errors'
  endif
endfunction

function! corpus#update_references(file) abort
  let l:config=v:lua.corpus.config_for_file(a:file)
  if !get(l:config, 'autoreference', 0)
    return
  endif

  " Skip over metadata.
  let l:raw=v:lua.corpus.metadata.raw()
  if len(l:raw)
    let l:start=len(l:raw) + 2 + 1
  else
    let l:start=1
  endif

  " Look for link reference definitions and reference links.
  let l:labels={}
  let l:references={}

  " We don't look for link reference definitions or reference links
  " inside of fenced code blocks.
  "
  " https://spec.commonmark.org/0.29/#fenced-code-blocks
  let l:fence=v:null

  for l:i in range(l:start, line('$'))
    let l:line=getline(l:i)

    if type(l:fence) == type(v:null)
      " Line starting with 3 (or more) backticks or 3 (or more) tildes.
      let l:match=matchlist(l:line, '\%#=1\v^ {0,3}(`{3,}|~{3,})[^`]*$')
      if len(l:match)
        let l:fence='\v^ {0,3}' . l:match[1][0] . '{' . len(l:match[1]) . ',}\s*$'
        continue
      endif
    else
      if match(l:line, l:fence) != -1
        let l:fence=v:null
      endif
      continue
    endif

    " Indented code block.
    " https://spec.commonmark.org/0.29/#indented-code-block
    if match(l:line, '\v^ {4}') != -1
      continue
    endif

    let l:match=corpus#extract_link_reference_definition(l:line)
    if len(l:match)
      let l:labels[tolower(l:match[0])]=l:match[1]
      continue
    endif

    for l:reference in corpus#extract_reference_links(l:line)
      let l:references[l:reference]=1
    endfor
  endfor

  " If there are existing labels, we assume they are at the bottom.
  let l:has_labels=!!len(l:labels)

  for l:reference in sort(keys(l:references))
    let l:key=tolower(l:reference)
    if !has_key(l:labels, l:key)
      " Have to add l:reference
      let l:labels[l:key]=l:reference

      if !l:has_labels
        " Add a blank separator line if there is not one there already.
        let l:has_labels=1
        if match(getline(line('$')), '\v^\s*$') == -1
          call append(line('$'), '')
        endif
      endif

      let l:base=get(l:config, 'base', '')
      let l:transform=get(l:config, 'transform', 'local')
      if l:transform == 'local'
        let l:target='<' . l:base . l:reference . '.md>'
      elseif l:transform == 'web'
        let l:target=substitute(l:base . l:reference, ' ', '_', 'g')
      else
        let l:target=l:base . l:reference
      endif
      call append(line('$'), '[' . l:reference . ']: ' . l:target)
    endif
  endfor
endfunction

function! corpus#complete(arglead, cmdline, cursor_pos) abort
  return v:lua.corpus.complete(a:arglead, a:cmdline, a:cursor_pos)
endfunction
