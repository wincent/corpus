<p align="center">
  <img src="https://raw.githubusercontent.com/wincent/corpus/media/corpus-logo.jpg" />
</p>

<p>
  <img src="https://raw.githubusercontent.com/wincent/corpus/media/corpus-vim.png" />
</p>

# corpus<a name="corpus-corpus" href="#user-content-corpus-corpus"></a>

## Intro<a name="corpus-intro" href="#user-content-corpus-intro"></a>

> Corpus is a note-management application for Neovim.

<p align="right"><a name="corpus-features" href="#user-content-corpus-features"><code>corpus-features</code></a></p>

Notes exist as Markdown files in a Git repository. Corpus provides:

- An interface for listing, searching, switching to, and creating notes.
- Bindings for creating links between notes.
- Optionally, automatic creation of Git commits after each save.
- Optionally, automatic creation of references for Markdown links.
- Optionally, automatic tagging or titling of content in Markdown frontmatter sections.
- Configurable rules for naming and linking such that Corpus directories can be used for local notes (eg. personal wikis) and hosted notes (eg. public wikis on the web).

If you're a visual person, the following screencast presents an early version of the plug-in and how it works: https://youtu.be/KRlNBcYw74I

This screencast shows a more recent update: https://youtu.be/kmsKO0hfHx8

## Installation<a name="corpus-installation" href="#user-content-corpus-installation"></a>

To install Corpus, use your plug-in management system of choice.

Note that Corpus requires a recent version of Neovim.

## Commands<a name="corpus-commands" href="#user-content-corpus-commands"></a>

<p align="right"><a name="corpus" href="#user-content-corpus"><code>:Corpus</code></a></p>

### `:Corpus {search}`<a name="corpus-corpus-search" href="#user-content-corpus-corpus-search"></a>

When inside a Corpus directory, accepts a search query. On the left side of Corpus will show a list of files containing all of the words in the search query. On the right side, it will show a preview of the currently selected file. The selection can be moved up and down with the <strong>`<Up>`</strong> and <strong>`<Down>`</strong> keys (or equivalently, with `<C-k>` and `<C-j>`. Pressing `<Enter>` opens the selection in a buffer. Pressing `<Esc>` dismisses the search interface.

If the search query does not match any files, pressing `<Enter>` will create a new file with the same name. As a special case, you can append an explicit &quot;.md&quot; file extension to the search query. This supports the following use case: imagine you want to create a file &quot;Foo.md&quot;, but your notes directory already contains a file &quot;Bar.md&quot; that happens to contain the string &quot;Foo&quot;. In this situation, typing &quot;Foo&quot; will show the &quot;Bar&quot; in the list of candidate files. Pressing `<Enter>` in this scenario would open &quot;Bar.md&quot;. If you instead type &quot;Foo.md&quot;, you can press `<Enter>` to create &quot;Foo.md&quot;.

When outside a Corpus directory, you can use tab-completion to switch to one of the configured <strong>`CorpusDirectories`</strong>.

## Mappings<a name="corpus-mappings" href="#user-content-corpus-mappings"></a>

In &quot;.md&quot; files inside a Corpus directory, &quot;corpus&quot; is added to the <strong>`'filetype'`</strong> and a buffer-local `<C-]>` mapping is configured. Hitting this mapping over a word turns it into a shorthand reference link. For example:

```
if cursor is on THIS here
```

it will turn into:

```
if cursor is on [THIS] here
```

In <strong>`Visual`</strong> mode, the selection can be turned into a link:

```
if THIS IS SELECTED here
```

hitting the mapping will produce:

```
if [THIS IS SELECTED] here
```

When the cursor is on such a link, hitting `<C-]>` will navigate to that file.

### `<Plug>(Corpus)`<a name="corpus-plugcorpus" href="#user-content-corpus-plugcorpus"></a>

Corpus maps &lt;Leader&gt;c to <strong>[`<Plug>(Corpus)`](#user-content-plugcorpus)</strong>, which triggers the <strong>[`:Corpus`](#user-content-corpus)</strong> command. To use an alternative mapping instead, create a different one in your <strong>`init.vim`</strong> instead using <strong>`:nmap`</strong>:

```
" Instead of <Leader>c, use <Leader>o.
nmap <leader>o <Plug>(Corpus)
```

## Options<a name="corpus-options" href="#user-content-corpus-options"></a>

Corpus relies on a list of <strong>`CorpusDirectories`</strong> defined as a Lua global variable in your <strong>`init.vim`</strong>. For example:

```
if has('nvim')
  lua <<
    CorpusDirectories = {
      ['~/Documents/Corpus'] = {
        autocommit = true,
        autoreference = 1,
        autotitle = 1,
        base = './',
        transform = 'local',
      },
      ['~/code/masochist/content/content/wiki'] = {
        autocommit = false,
        autoreference = 1,
        autotitle = 1,
        base = '/wiki/',
        tags = {'wiki'},
        transform = 'web',
      },
  }
.
endif
```

Keys in the table name directories containing Corpus notes. These directories should be Git repositories. A tilde in the name will be automatically expanded.

Values are tables describing the desired behavior for the corresponding directory.

<p align="right"><a name="corpus-autocommit" href="#user-content-corpus-autocommit"><code>corpus-autocommit</code></a></p>

### `autocommit`<a name="corpus-autocommit" href="#user-content-corpus-autocommit"></a>

When `true`, Corpus will create a commit each time a file is written.

Defaults to `false`.

<p align="right"><a name="corpus-autoreference" href="#user-content-corpus-autoreference"><code>corpus-autoreference</code></a></p>

### `autoreference`<a name="corpus-autoreference" href="#user-content-corpus-autoreference"></a>

When true, Corpus will update Markdown link references each time a file is saved. For example, given this text:

```
This one [is a link] to somewhere else.
```

We will see references like the following created at the bottom of the file:

```
[is a link]: <./is a link.md>
```

Defaults to `false`.

<p align="right"><a name="corpus-autotitle" href="#user-content-corpus-autotitle"><code>corpus-autotitle</code></a></p>

### `autotitle`<a name="corpus-autotitle" href="#user-content-corpus-autotitle"></a>

When true, Corpus will update the `title` in the Markdown frontmatter (based on the filename) each time the note is saved.

For example, a file named &quot;Some article.md&quot; would produce the following metadata:

```
title: Some article
```

Defaults to `false`.

<p align="right"><a name="corpus-base" href="#user-content-corpus-base"><code>corpus-base</code></a></p>

### `base`<a name="corpus-base" href="#user-content-corpus-base"></a>

When set, Corpus will use the `base` as a prefix when generating link targets, which is particularly useful when the notes in question are to be hosted on a public website.

For example, give a `base` of &quot;/wiki/&quot; and a link such as &quot;foobar&quot;, the resulting link target will be &quot;/wiki/foobar&quot;.

Defaults to an empty string.

<p align="right"><a name="corpus-tags" href="#user-content-corpus-tags"><code>corpus-tags</code></a></p>

### `tags`<a name="corpus-tags" href="#user-content-corpus-tags"></a>

When true, Corpus will update the `tags` list in the Markdown frontmatter (based on the filename) each time the note is saved.

For example, given a `tags` value of `{'foo', 'bar'}`, Corpus would produce the following metadata:

```
tags: foo bar
```

Defaults to `nil`, which means that no tags get added to the frontmatter.

<p align="right"><a name="corpus-transform" href="#user-content-corpus-transform"><code>corpus-transform</code></a></p>

### `transform`<a name="corpus-transform" href="#user-content-corpus-transform"></a>

When set to &quot;local&quot;, tells Corpus to transform filenames into link targets in a way that is suitable for navigating between files on a local filesystem. This is the &quot;local personal wiki&quot; use case. For example, given a filename of &quot;Shopping list.md&quot;, we have:

- A title of &quot;Shopping list&quot;.
- Links of the form `[Shopping list]`.
- Link targets of the form `Shopping list.md`.

When set to &quot;web&quot;, tells Corpus to transform filenames into link targets in a way that is suitable for deployment as a public wiki on the web. Spaces are transformed into underscores, and the <strong>[`corpus-base`](#user-content-corpus-base)</strong> setting is prepended. For example, given a filename of &quot;Troubleshooting tips.md&quot;, we have:

- A title of &quot;Troubleshooting tips&quot;.
- Links of the form `[Troubleshooting tips]`.
- Link targets of the form `/wiki/Troubleshooting_tips`.

Defaults to 'local'.

<p align="right"><a name="gcorpusloaded" href="#user-content-gcorpusloaded"><code>g:CorpusLoaded</code></a></p>

### `g:CorpusLoaded` (any, default: none)<a name="corpus-gcorpusloaded-any-default-none" href="#user-content-corpus-gcorpusloaded-any-default-none"></a>

To prevent Corpus from being loaded, set <strong>[`g:CorpusLoaded`](#user-content-gcorpusloaded)</strong> to any value in your <strong>`init.vim`</strong>. For example:

```
let g:CorpusLoaded=1
```

## Website<a name="corpus-website" href="#user-content-corpus-website"></a>

The official Corpus source code repo is at:

http://git.wincent.com/corpus.git

A mirror exists at:

https://github.com/wincent/corpus

## License<a name="corpus-license" href="#user-content-corpus-license"></a>

Copyright (c) 2015-present Greg Hurrell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Development<a name="corpus-development" href="#user-content-corpus-development"></a>

### Contributing patches<a name="corpus-contributing-patches" href="#user-content-corpus-contributing-patches"></a>

Patches can be sent via mail to greg@hurrell.net, or as GitHub pull requests at: https://github.com/wincent/corpus/pulls

## Authors<a name="corpus-authors" href="#user-content-corpus-authors"></a>

Corpus is written and maintained by Greg Hurrell &lt;greg@hurrell.net&gt;.

## History<a name="corpus-history" href="#user-content-corpus-history"></a>

### master (not yet released)<a name="corpus-master-not-yet-released" href="#user-content-corpus-master-not-yet-released"></a>

- Initial release.
