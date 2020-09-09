-- Copyright 2015-present Greg Hurrell. All rights reserved.
-- Licensed under the terms of the MIT license.

local util = require 'corpus.util'

corpus = {
  commit = function(file, operation)
    local config = corpus.config_for_file(file)
    if config.autocommit then
      file = vim.fn.fnamemodify(file, ':t')
      local location = vim.fn.expand(config.location)
      local subject = 'docs: ' .. operation .. ' ' .. vim.fn.fnamemodify(file, ':r') .. ' (Corpus autocommit)'

      -- Just in case this is a new file (otherwise `git commit` will fail).
      corpus.git(location, 'add', '--', file)
      -- TODO: check v:shell_error for this one ^^^
      -- vim.api.nvim_get_vvar('shell_error')

      -- Note that this will fail silently if there are no changes to the
      -- file (because we aren't passing `--allow-empty`) and that's ok.
      corpus.git(location, 'commit', '-m', subject, '--', file)
    end
  end,

  -- Returns config from the `CorpusDirectories` (Lua global) for
  -- `file`, or an empty table if `file` is not in one of the
  -- directories defined in `CorpusDirectories`.
  config_for_file = function(file)
    local base = vim.fn.fnamemodify(file, ':h')
    local config = _G.CorpusDirectories or vim.empty_dict()
    for directory, settings in pairs(config) do
      local candidate = corpus.normalize(directory)
      if candidate == base then
        return vim.tbl_extend('force', {location = candidate}, settings)
      end
    end
    return vim.empty_dict()
  end,

  -- If current working directory is a configured Corpus directory, returns it.
  -- Otherwise, returns the first found default.
  directory = function()
    if corpus.in_directory() then
      return vim.fn.getcwd()
    else
      local directories = corpus.directories()
      return directories[1]
    end
  end,

  directories = function()
    local config = _G.CorpusDirectories or vim.empty_dict()
    local directories = util.dict.keys(config)
    if table.getn(directories) == 0 then
      vim.api.nvim_err_writeln(
        'No Corpus directories configured: please set CorpusDirectories'
      )
    end
    return util.list.map(directories, function(directory)
      return corpus.normalize(directory)
    end)
  end,

  -- Adds 'corpus' to the 'filetype' if the current file is under a directory
  -- configured via `g:CorpusDirectories`.
  ftdetect = function()
    local file = corpus.normalize('<afile>')
    local config = corpus.config_for_file(file)
    if next(config) ~= nil then
      local filetypes = vim.split(vim.bo.filetype, '.', true)
      if not util.list.includes(filetypes, 'corpus') then
        vim.bo.filetype = vim.bo.filetype .. '.corpus'
      end
    end
  end,

  git = function(directory, ...)
    if vim.fn.isdirectory(directory) == 0 then
      error('Not a directory: ' .. directory)
    end
    if vim.fn.isdirectory(directory .. '/.git') == 0 then
      -- TODO: decide whether it's right to do this unconditionally like this
      corpus.run({'git', '-C', directory, 'init'})
    end

    local command = util.list.concat({'git', '-C', directory}, {...})
    return corpus.run(command)
  end,

  in_directory = function()
    local directories = corpus.directories()
    local cwd = vim.fn.getcwd()
    return util.list.includes(directories, cwd)
  end,

  -- List all documents in the corpus.
  list = function()
    local directory = corpus.directory()
    if directory ~= nil then
      local files = corpus.git(
        directory,
        'ls-files',
        '--cached',
        '--others',
        '-z',
        '--',
        '*.md'
      )
      if table.maxn(files) == 1 then
        return vim.split(files[1], '\n', true)
      end
    end
    return {}
  end,

  search = function(terms)
    local directory = corpus.directory()
    if directory ~= nil then
      local args = {
        'grep',
        '-I',
        '-F',
        '-l',
        '-z',
        '--all-match',
        '--untracked'
      }

      if not corpus.smartcase(terms) then
        table.insert(args, '-i')
      end

      for term in terms:gmatch('%S+') do
        table.insert(args, '-e')
        table.insert(args, term)
      end

      table.insert(args, '--')
      table.insert(args, '*.md')

      local files = corpus.git(directory, unpack(args))

      if table.getn(files) == 1 then
        -- Expect one long "line" from `git grep`, containing NUL
        -- separator bytes, which Vim turns into newlines; we
        -- split on those to get a list.
        --
        -- Also note Git Bug here: -z here doesn't always prevent stuff
        -- from getting escaped; if in a subdirectory, `git grep` may
        -- return results like:
        --
        --    "\"HTML is probably what you want\".md"
        --    Akephalos.md
        --    JavaScript loading.md
        --
        -- See: https://public-inbox.org/git/CAOyLvt9=wRfpvGGJqLMi7=wLWu881pOur8c9qNEg+Xqhf8W2ww@mail.gmail.com/
        local list = {}
        for file in files[1]:gmatch('[^\n]+') do
          if vim.startswith(file, '"') and vim.endswith(file, '"') then
            table.insert(list, file:sub(2, -2):gsub('\\"', '"'))
          else
            table.insert(list, file)
          end
        end
        return list
      end
    end

    return {}
  end,

  -- Turns `afile` into a simplified absolute path with all symlinks resolved.
  -- If `afile` corresponds to a directory any trailing slash will be removed.
  normalize = function(afile)
    local file = vim.fn.fnamemodify(vim.fn.resolve(vim.fn.expand(afile)), ':p')
    if vim.endswith(file, '/') then
      return file:sub(0, file:len() - 1)
    else
      return file
    end
  end,

  log = function(message)
    -- Because I don't know how to do "unsilent" version of `print()`.
    vim.api.nvim_command('unsilent echomsg "' .. message .. '"')
  end,

  -- TODO: better name for the param here (it's more than just args; it is
  -- command plus args)
  run = function(args)
    local command = table.concat(util.list.map(args, function(word)
      return vim.fn.shellescape(word)
    end), ' ')
    return vim.fn.systemlist(command)
  end,

  -- Like 'smartcase', will be case-insensitive unless argument contains an
  -- uppercase letter.
  smartcase = function(input)
    return input:match('%u') ~= nil
  end,

  title_for_file = function(file)
    return vim.fn.fnamemodify(file, ':t:r')
  end,
}

return corpus
