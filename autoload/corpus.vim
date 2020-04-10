" When opening a new file in a Corpus-managed location, pre-populate it
" with metadata of the form:
"
"   ---
"   title: Title based on file name
"   tags: wiki
"   ---
"
" or:
"
"   ---
"   title: Title based on file name
"   ---
"
function! corpus#buf_new_file() abort
  let l:file=expand('<afile>')
  let l:config=corpus#config_for_file(l:file)
  if len(l:config)
    call corpus#update_metadata(l:file)
  endif
endfunction

function! corpus#buf_write_post() abort
  let l:file=expand('<afile>')
  call corpus#commit(l:file)
endfunction

function! corpus#buf_write_pre() abort
  let l:file=expand('<afile>')
  call corpus#update_references()
  call corpus#update_metadata(l:file)
endfunction

function! corpus#commit(file) abort
  " TODO implement
  " TODO make this per-directory configurable (don't want it in masochist, for
  " example)
  unsilent echomsg 'git commit ' . a:file
endfunction

" Returns config from `g:CorpusDirectories` for `file`, or an empty dictionary
" if `file` is not in one of the directories defined in `g:CorpusDirectories`.
function! corpus#config_for_file(file) abort
  let l:base=fnamemodify(a:file, ':p:h')
  let l:config=get(g:, 'CorpusDirectories', {})
  for l:directory in keys(l:config)
    let l:candidate=fnamemodify(l:directory, ':p')
    let l:len=len(l:candidate)
    if l:candidate[l:len - 1] == '/'
      let l:candidate=strpart(l:candidate, 0, l:len - 1)
    endif
    if l:candidate == l:base
      return l:config[l:directory]
    endif
  endfor
  return {}
endfunction

" Adds 'corpus' to the 'filetype' if the current file is under a
" directory configured via `g:CorpusDirectories`.
function! corpus#ftdetect() abort
  let l:file=expand('<afile>')
  let l:config=corpus#config_for_file(l:file)
  if len(l:config)
    set filetype+=.corpus
  endif
endfunction

let s:metadata_key_value_pattern='\v^\s*(\w+)\s*:\s*(\S.{-})\s*$'

function! corpus#get_metadata_raw() abort
  if match(getline(1), '\v^---\s*$') != -1
    let l:metadata=[]
    for l:i in range(2, line('$'))
      let l:line=getline(l:i)
      if match(l:line, '\v^\s*$') != -1
        continue
      elseif match(l:line, '\v^---\s*$') != -1
        return l:metadata
      endif
      let l:match=matchlist(l:line, s:metadata_key_value_pattern)
      if len(l:match) == 0
        return []
      endif
      call add(l:metadata, (l:match[0]))
    endfor
  endif
  return {}
endfunction

function! corpus#get_metadata() abort
  let l:raw=corpus#get_metadata_raw()
  if len(l:raw)
    let l:metadata={}
    for l:line in l:raw
      let l:match=matchlist(l:line, s:metadata_key_value_pattern)
      let l:metadata[l:match[1]]=l:match[2]
    endfor
    return l:metadata
  else
    return {}
  endif
endfunction

function! corpus#set_metadata(metadata) abort
  " Remove old metadata, if present.
  let l:raw=corpus#get_metadata_raw()
  if (len(l:raw))
    " +2 lines for the '---' delimiters.
    call deletebufline('.', 1, len(l:raw) + 2)
  endif

  " Format new metadata.
  let l:lines=['---']
  let l:keys=keys(a:metadata)
  for l:key in l:keys
    call add(l:lines, l:key . ': ' . a:metadata[l:key])
  endfor
  call add(l:lines, '---')

  " Prepend new metadata.
  call append(0, l:lines)

  " Make sure there is at least one blank line after metadata.
  " +2 lines for the '---' delimiters.
  " +1 more to see next line.
  let l:next=len(l:keys) + 2 + 1
  if match(getline(l:next), '\v^\s*$') == -1
    call append(l:next - 1, '')
  endif
endfunction

function! corpus#title_for_file(file) abort
  return fnamemodify(a:file, ':t:r')
endfunction

function! corpus#update_references() abort
  " TODO
  unsilent echomsg 'update refs'
endfunction

function! corpus#update_metadata(file) abort
  let l:metadata=corpus#get_metadata()

  let l:title=corpus#title_for_file(a:file)
  let l:metadata.title=l:title

  let l:config=corpus#config_for_file(a:file)
  if has_key(l:config, 'tags')
    let l:tags=split(get(l:metadata, 'tags', ''))
    for l:tag in l:config.tags
      if index(l:tags, l:tag) == -1
        call add(l:tags, l:tag)
      endif
    endfor
    let l:metadata.tags=join(l:tags)
  endif
  call corpus#set_metadata(l:metadata)
endfunction

" =============================================================================
" =============================================================================
" =============================================================================

finish

function! corpus#directory() abort
  " TODO: support multiple directories (eg. masochist wiki subdir, corpus)
  let l:directory=fnamemodify(get(g:, 'CorpusDirectory', '~/Documents/Corpus'), ':p')
  let l:len=len(l:directory)
  if l:directory[l:len - 1] == '/'
    return strpart(l:directory, 0, l:len - 1)
  else
    return l:directory
  endif
endfunction

function! corpus#choose(selection) abort
  if corpus#exists(a:selection)
    execute 'edit ' . fnameescape(a:selection)
  else
    " TODO: if no "md" suffix, add it
  endif

  " TODO: decide whether we want to close preview once finished selecting
  " a file (maybe?)
  pclose
endfunction

function! corpus#cmdline_changed(char) abort
  if a:char == ':'
    let l:line=getcmdline()
    let l:match=matchlist(l:line, '\v^\s*Corpus\s+(.{-})\s*$')
    if len(l:match)
      " call corpus#open_loclist()
      call corpus#open_qflist()

      let l:terms=l:match[1]
      if len(l:terms)
        " Weight title matches higher
        " TODO: weight left-most matches higher
        let l:results=corpus#search_titles(l:terms)
        call extend(l:results, corpus#search_content(l:terms))
        if len(l:results)
          call corpus#preview(l:results[0])

          " Update location list.
          let l:list=map(l:results, {i, val -> {
                \   'filename': val,
                \   'lnum': 1
                \ }})
          " call setloclist(0, l:list, 'r', {'title': 'Corpus'})
          call setqflist([], 'r', {'items': l:list, 'title': 'Corpus'})
        endif
      endif
    endif
  endif
endfunction

let s:notes=[]

function! corpus#cmdline_enter(char) abort
  if a:char == ':'
    " TODO: only do this if we previously wrote a change to the directory
    " TODO: only do it if we're actually running :Corpus and not something else

    let l:directory=corpus#directory()
    let l:glob=corpus#join(l:directory, '*.md')
    let s:notes=glob(l:glob, 1, 1)

    " Convert absolute paths to basenames.
    call map(s:notes, {i, file -> fnamemodify(file, ':t')})

    call sort(s:notes)
  endif
endfunction

" Custom completion function.
"
" If the command line currently contains:
"
"     :Corpus abcdef
"
" and the cursor is currently at "d", on hitting <Tab>, we'll be called with:
"
" - arg_lead: "abc"
" - cmd_line: "Corpus abcdef"
" - cursor_pos: 10
"
function! corpus#complete(arg_lead, cmd_line, cursor_pos) abort
  let l:head=a:arg_lead
  let l:tail=strpart(a:cmd_line, a:cursor_pos)
  let l:matches=filter(copy(s:notes), {i, basename -> stridx(basename, l:head) == 0})
  return l:matches
endfunction

function! corpus#exists(basename) abort
  return filereadable(corpus#file(a:basename))
endfunction

" Get the full path to a file in the Corpus directory.
function! corpus#file(basename) abort
  return corpus#join(corpus#directory(), a:basename)
endfunction

" Join multiple path components using a separator (/).
function! corpus#join(...) abort
  return join(a:000, '/')
endfunction

" Returns 1 if all needles are present in haystack.
function! corpus#match(haystack, needles) abort
  let l:haystack_len=len(a:haystack)
  for l:needle in a:needles
    let l:index=stridx(a:haystack, l:needle)
    if l:index==-1
      " Needle wasn't found.
      return 0
    else
      if l:index + len(l:needle) == l:haystack_len
        " Needle was found, but only if we include the extension in the
        " haystack, and we don't want to do that.
        return 0
      endif
    endif
  endfor

  " No needles were missing: success.
  " Note that this means that an empty search always matches.
  return 1
endfunction

function! corpus#open_loclist() abort
  let l:wininfo=getwininfo()
  let l:loclists=filter(getwininfo(), 'v:val.loclist')
  if !len(l:loclists)
    try
      lopen
    catch /./
      " Could happen if preview window has focus, for example.
    endtry
  endif
endfunction

function! corpus#open_qflist() abort
  let l:wininfo=getwininfo()
  let l:qflist=filter(getwininfo(), 'v:val.quickfix && !v:val.loclist')
  if !len(l:qflist)
    call setqflist([], 'r', {'title': 'Corpus'})
    copen
  endif
endfunction

function! corpus#preview(basename) abort
  let l:file=corpus#file(a:basename)
  execute 'pedit ' . fnameescape(l:file)
  redraw
endfunction

function! corpus#run(args) abort
  let l:args=copy(a:args)
  call map(l:args, {i, word -> shellescape(word)})
  let l:command=join(l:args, ' ')
  return systemlist(l:command)
endfunction

" This isn't ideal, but we do content searches with Git and title searches
" internally, which means that if you search for "foo bar" and we have a
" document called "foo.md" with contents "bar", we won't find it.
"
" In order to provide unified search, we'd need to do all searching internally,
" or all searching externally via a custom process.
function! corpus#search_content(terms) abort
  let l:command=[
        \   'git',
        \   '-C',
        \   corpus#directory(),
        \   'grep',
        \   '-I',
        \   '-F',
        \   '-l',
        \   '-z',
        \   '--all-match',
        \   '--full-name',
        \   '--untracked',
        \ ]

  if !corpus#smartcase(a:terms)
    call add(l:command, '-i')
  endif

  for l:term in split(a:terms)
    call extend(l:command, ['-e', l:term])
  endfor
  call extend(l:command, ['--', '*.md'])
  let l:files=corpus#run(l:command)
  if len(l:files) == 1
    " We expect one lone line from `git grep`, and Vim will have turned
    " NUL bytes inside that line into newlines, so we split again.
    return split(l:files[0], '\n')
  else
    return []
  endif
endfunction

function! corpus#search_titles(terms) abort
  let l:smartcase=corpus#smartcase(a:terms)
  let l:terms=split(a:terms)

  if !l:smartcase
    map(l:terms, {i, val -> tolower(val)})
  endif

  return filter(copy(s:notes), {i, val -> corpus#match(l:smartcase ? val : tolower(val), l:terms)})
endfunction

" Like 'smartcase', will be case-insensitive unless argument contains an
" uppercase letter.
function! corpus#smartcase(terms) abort
  return match(a:terms, '\v[A-Z]') == -1
endfunction
