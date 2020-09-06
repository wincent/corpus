-- Copyright 2015-present Greg Hurrell. All rights reserved.
-- Licensed under the terms of the MIT license.

corpus = {
  -- Returns config from the `CorpusDirectories` (Lua global) for
  -- `file`, or an empty table if `file` is not in one of the
  -- directories defined in `CorpusDirectories`.
  config_for_file = function(file)
    local base = vim.fn.fnamemodify(file, ':h')
    local config = _G.CorpusDirectories or {}
    for directory, settings in pairs(config) do
      local candidate = corpus.normalize(directory)
      if candidate == base then
        return vim.tbl_extend('force', {location = candidate}, settings)
      end
    end
    return {}
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
    local config = _G.CorpusDirectories or {}
    local directories = corpus.keys(config)
    if table.getn(directories) == 0 then
      vim.api.nvim_err_writeln(
        'No Corpus directories configured: please set CorpusDirectories'
      )
    end
    return corpus.map(directories, function(directory)
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
      if not corpus.includes(filetypes, 'corpus') then
        vim.bo.filetype = vim.bo.filetype .. '.corpus'
      end
    end
  end,

  -- TODO: move this to utility module
  includes = function(list, item)
    for _, v in ipairs(list) do
      if v == item then
        return true
      end
    end
    return false
  end,

  in_directory = function()
    local directories = corpus.directories()
    local cwd = vim.fn.getcwd()
    return corpus.includes(directories, cwd)
  end,

  -- TODO: move this to utility module
  keys = function(tbl)
    local result = {}
    for key, _ in pairs(tbl) do
      table.insert(result, key)
    end
    return result
  end,

  -- List all documents in the corpus.
  list = function()
    local directory = corpus.directory()
    if directory ~= nil then
      local files = corpus.run({
        'git',
        '-C',
        directory,
        'ls-files',
        '--cached',
        '--others',
        '-z',
        '--',
        '*.md',
      })
      if table.maxn(files) == 1 then
        return vim.split(files[1], '\n', true)
      end
    end
    return {}
  end,

  -- TODO: move this to utility module
  map = function(list, cb)
    local result = {}
    for i, v in ipairs(list) do
      result[i] = cb(v)
    end
    return result
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

  run = function(args)
    local command = table.concat(corpus.map(args, function(word)
      return vim.fn.shellescape(word)
    end), ' ')
    return vim.fn.systemlist(command)
  end,
}

return corpus
