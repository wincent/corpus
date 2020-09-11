" Copyright 2015-present Greg Hurrell. All rights reserved.
" Licensed under the terms of the MIT license.

""
" @option g:CorpusLoaded any
"
" To prevent Corpus from being loaded, set |g:CorpusLoaded| to any value in your
" |.vimrc|. For example:
"
" ```
" let g:CorpusLoaded=1
" ```
if exists('g:CorpusLoaded') || &compatible || !has('nvim')
  finish
endif

let g:CorpusLoaded=1
"
" Temporarily set 'cpoptions' to Vim default as per `:h use-cpo-save`.
let s:cpoptions=&cpoptions
set cpoptions&vim

function! s:RequireCorpus()
  " TODO: on first run, rewrite autocommands to not call this on subsequent runs.
  lua require'corpus'
endfunction

if has('autocmd')
  augroup Corpus
    autocmd!
    autocmd BufNewFile *.md call corpus#buf_new_file()

    if exists('##CmdlineChanged')
      autocmd CmdlineChanged * call s:RequireCorpus() | call v:lua.corpus.cmdline_changed(expand('<afile>'))
    endif

    autocmd CmdlineEnter * call s:RequireCorpus() | call v:lua.corpus.cmdline_enter()
    autocmd CmdlineLeave * call s:RequireCorpus() | call v:lua.corpus.cmdline_leave()
  augroup END
endif

command! -complete=customlist,corpus#complete -nargs=* Corpus call v:lua.corpus.choose(<q-args>)

nnoremap <Plug>(Corpus) :Corpus<Space>

if !hasmapto('<Plug>(Corpus)') && maparg('<Leader>c', 'n') ==# ''
  nmap <unique> <Leader>c <Plug>(Corpus)
endif

" Restore 'cpoptions' to its former value.
let &cpoptions = s:cpoptions
unlet s:cpoptions
