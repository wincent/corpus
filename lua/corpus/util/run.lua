-- Copyright 2015-present Greg Hurrell. All rights reserved.
-- Licensed under the terms of the MIT license.

local SIGTERM = 15

local close = function(closable)
  if not closable:is_closing() then
    closable:close()
  end
end

local util = {
  -- Low-level util for running an executable and returning its output.
  --
  -- Prior art:
  --
  --  - https://teukka.tech/vimloop.html
  --  - https://github.com/TravonteD/luajob/blob/master/lua/luajob.lua
  --  - https://github.com/neovim/nvim-lspconfig/blob/94012296bc5/lua/nvim_lsp/util.lua##L411-L464
  --
  run = function(command, args, options)
    local cancelled = false

    local callback = function(key, options)
      return vim.schedule_wrap(function(...)
        if not cancelled and options ~= nil and options[key] ~= nil then
          options[key](...)
        end
      end)
    end

    local stderr = vim.loop.new_pipe(false)
    local stdin = vim.loop.new_pipe(false)
    local stdout = vim.loop.new_pipe(false)

    local on_exit = callback('on_exit', options)
    local on_stderr = callback('on_stderr', options)
    local on_stdout = callback('on_stdout', options)

    local handle, pid

    handle, pid = vim.loop.spawn(
      command, {
        args = args,
        stdio = {stdin, stdout, stderr},
        cwd = cwd or '.',
        env = env,
      },
      vim.schedule_wrap(function(code, signal) 
        stdout:read_stop()
        stderr:read_stop()

        close(stderr)
        close(stdin)
        close(stdout)
        close(handle)

        on_exit(code, signal)
      end)
    )

    stdout:read_start(on_stdout)
    stderr:read_start(on_stderr)

    -- TODO: maybe provide a way to pipe something in.
    stdin:shutdown()

    local cancel = function()
      cancelled = true
      if not handle:is_closing() then
        handle:kill(SIGTERM)
      end
    end

    return {
      cancel = cancel,
    }
  end,
}

return util.run
