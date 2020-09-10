-- Copyright 2015-present Greg Hurrell. All rights reserved.
-- Licensed under the terms of the MIT license.

local util = require 'corpus.util'

local chooser_buffer = nil
local chooser_selected_index = nil
local chooser_window = nil

local preview_buffer = nil
local preview_window = nil

-- TODO: can we make these a bit more private?
local mappings = {
  ['<C-j>'] = '<Cmd>lua corpus.preview_next()<CR>',
  ['<C-k>'] = '<Cmd>lua corpus.preview_previous()<CR>',
  ['<Down>'] = '<Cmd>lua corpus.preview_next()<CR>',
  ['<Up>'] = '<Cmd>lua corpus.preview_previous()<CR>',
}

-- TODO: detect pre-existing mappings, save them, and restore them if needed.
local set_up_mappings = function()
  for lhs, rhs in pairs(mappings) do
    vim.api.nvim_set_keymap('c', lhs, rhs, {silent = true})
  end
end

local tear_down_mappings = function()
  for lhs, rhs in pairs(mappings) do
    if vim.fn.maparg(lhs, 'c') == rhs then
      -- TODO: find out if bang from old version was actually necessary
      -- vim.cmd('silent! cunmap ' .. lhs)
      vim.api.nvim_del_keymap('c', lhs)
    end
  end
end

-- TODO make most of these private (really only want them public for testing
-- during development)
corpus = {
  cmdline_changed = function(char)
    if char == ':' then
      local line = vim.fn.getcmdline()
      local _, _, term = string.find(line, '^%s*Corpus%f[%A]%s*(%S*)%s*$')
      if term ~= nil then
        if corpus.in_directory() then
          set_up_mappings()
          if chooser_window == nil then
            chooser_buffer = vim.api.nvim_create_buf(
              false, -- listed?
              true -- scratch?
            )
            chooser_window = vim.api.nvim_open_win(
              chooser_buffer,
              false --[[ enter? --]], {
                col = 0,
                row = 0,
                focusable = false,
                relative = 'editor',
                style = 'minimal',
                width = math.floor(vim.api.nvim_get_option('columns') / 2),
                height = vim.api.nvim_get_option('lines') - 2,
              }
            )
            vim.api.nvim_win_set_option(chooser_window, 'wrap', false)
          end

          local results = nil
          if term:len() > 0 then
            results = corpus.search(term)
          else
            results = corpus.list()
          end

          local lines = nil
          if #results > 0 then
            -- 1 because Neovim cursor indexing is 1-based, as are Lua lists.
            chooser_selected_index = 1

            vim.api.nvim_win_set_cursor(window, {1, 0})
            lines = util.list.map(results, function (result, i)
              local name = vim.fn.fnamemodify(result, ':r')
              if i == chooser_selected_index then
                return '> ' .. name
              else
                return '  ' .. name
              end
            end)
          else
            lines = {}
            chooser_selected_index = nil
          end

          vim.api.nvim_buf_set_lines(
            chooser_buffer,
            0, -- start
            -1, -- end
            false, -- strict indexing?
            lines
          )

          -- Reserve two lines for statusline and command line.
          vim.api.nvim_win_set_height(
            window,
            vim.api.nvim_get_option('lines') - 2
          )

          -- TODO: only do this if lines actually changed, or selection changed
          corpus.preview(lines) -- TODO: debounce this like original
          -- TODO: confirm we still need this
          vim.cmd('redraw')
          return
        end
      end
    end
    tear_down_mappings()
  end,

  cmdline_enter = function()
    chooser_selected_index = nil
  end,

  cmdline_leave = function()
    if chooser_window ~= nil then
      vim.api.nvim_win_close(chooser_window, true --[[ force? --]])
      chooser_window = nil
    end
    if preview_window ~= nil then
      vim.api.nvim_win_close(preview_window, true --[[ force? --]])
      preview_window = nil
    end
    tear_down_mappings()
  end,

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
    local directories = vim.tbl_keys(config)
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
      if not vim.tbl_contains(filetypes, 'corpus') then
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
    return vim.tbl_contains(directories, cwd)
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
        return vim.split(vim.trim(files[1]), '\n', true)
      end
    end
    return {}
  end,

  preview = function()
    if chooser_selected_index ~= nil then
      local line = vim.api.nvim_buf_get_lines(
        chooser_buffer,
        chooser_selected_index - 1,
        chooser_selected_index,
        false
      )[1]

      -- Strip leading "> " or "  ", and append extension.
      local file = line:sub(3, line:len()) .. '.md'

      if preview_buffer == nil then
        preview_buffer = vim.api.nvim_create_buf(
          false, -- listed?
          true -- scratch?
        )
      end
      local lines = vim.api.nvim_get_option('lines')
      if preview_window == nil then
        -- TODO: kill the background window blur on this thing; makes it look
        -- ugly; failing that, a border around the edge would fix it.
        local width = math.floor(vim.api.nvim_get_option('columns') / 2)
        preview_window = vim.api.nvim_open_win(
          preview_buffer,
          false --[[ enter? --]], {
              col = width,
              row = 0,
              focusable = false,
              relative = 'editor',
              style = 'minimal',
              width = width,
              height = lines - 2,
          }
        )
      end
      local contents = vim.fn.readfile(
        file,
        '', -- if "b" then binary
        lines -- maximum lines
      )
      vim.api.nvim_buf_set_lines(
        preview_buffer,
        0, -- start
        -1, -- end
        false, -- strict indexing?
        contents
      )
      -- TODO: may be able to avoid double redraw... (already calling it
      -- from cmdline_changed() -- might be able to remove it from there
      vim.cmd('redraw')
    end
  end,

  preview_next = function()
    if chooser_selected_index ~= nil then
      if chooser_selected_index < vim.api.nvim_buf_line_count(chooser_buffer) then
        local lines = vim.api.nvim_buf_get_lines(
          chooser_buffer,
          chooser_selected_index - 1,
          chooser_selected_index + 1,
          false
        )
        vim.api.nvim_buf_set_lines(
          chooser_buffer,
          chooser_selected_index - 1,
          chooser_selected_index + 1,
          false, -- strict indexing?
          {
            ({lines[1]:gsub('^..', '  ')})[1],
            ({lines[2]:gsub('^..', '> ')})[1],
          }
        )
        vim.api.nvim_win_set_cursor(chooser_window, {chooser_selected_index, 0})
        chooser_selected_index = chooser_selected_index + 1
        vim.cmd('redraw') -- TODO: check if we need this (may only need it if debouncing, because preview will do it)
        --corpus.preview()
      end
    end
  end,

  -- TODO: DRY this up; it is very similar to preview_next
  preview_previous = function()
    if chooser_selected_index ~= nil then
      if chooser_selected_index > 1 then
        local lines = vim.api.nvim_buf_get_lines(
          chooser_buffer,
          chooser_selected_index - 2,
          chooser_selected_index,
          false
        )
        vim.api.nvim_buf_set_lines(
          chooser_buffer,
          chooser_selected_index - 2,
          chooser_selected_index,
          false, -- strict indexing?
          {
            ({lines[1]:gsub('^..', '> ')})[1],
            ({lines[2]:gsub('^..', '  ')})[1],
          }
        )
        chooser_selected_index = chooser_selected_index - 1
        vim.api.nvim_win_set_cursor(chooser_window, {chooser_selected_index, 0})
        vim.cmd('redraw') -- TODO: check if we need this (may only need it if debouncing, because preview will do it)
        --corpus.preview()
      end
    end
  end,

  -- TODO: if this gets slow/sluggish, may have to run it as async job.
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
        util.list.push(args, '-e', term)
      end

      util.list.push(args, '--', '*.md')

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
