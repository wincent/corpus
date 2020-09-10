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
if exists('g:CorpusLoaded') || &compatible || v:version < 700
  finish
endif

let g:CorpusLoaded=1
"
" Temporarily set 'cpoptions' to Vim default as per `:h use-cpo-save`.
let s:cpoptions=&cpoptions
set cpoptions&vim

" TODO: don't eagerly require this
lua require'corpus'

if has('autocmd')
  augroup Corpus
    autocmd!
    autocmd BufNewFile *.md call corpus#buf_new_file()

    " TODO: don't blow up on macOS /usr/bin/vim; will need deeper fix in long term
    if exists('##CmdlineChanged')
      autocmd CmdlineChanged * call v:lua.corpus.cmdline_changed(expand('<afile>'))
    endif

    autocmd CmdlineEnter * call v:lua.corpus.cmdline_enter()
    autocmd CmdlineLeave * call v:lua.corpus.cmdline_leave()
  augroup END
endif

command! -complete=customlist,corpus#complete -nargs=* Corpus call corpus#choose(<q-args>)

nnoremap <Plug>(Corpus) :Corpus<Space>

if !hasmapto('<Plug>(Corpus)') && maparg('<Leader>c', 'n') ==# ''
  nmap <unique> <Leader>c <Plug>(Corpus)
endif

" Restore 'cpoptions' to its former value.
let &cpoptions = s:cpoptions
unlet s:cpoptions
