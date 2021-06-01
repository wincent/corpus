-- Copyright 2015-present Greg Hurrell. All rights reserved.
-- Licensed under the terms of the MIT license.

--- TODO: would it be worth it to embed
--- https://github.com/exosite/lua-yaml/blob/master/yaml.lua?
local M = {}

---YAML Key-value pair pattern
local kv_pattern = [[\v^\s*(\w+)\s*:\s*(\S.{-})\s*$]]

---Given a list of key value pairs, update key with value
-- @param key string
-- @param value string
local set_kv_list = function (list, key, value)
  for _, kv in ipairs(list) do
    if kv[1] == key then kv[2] = value end
  end
end

---Get value from key-value pair list
---@param list any
---@return string?
local get_kv_list = function(list, key)
  for _, kv in ipairs(list) do
    if kv[1] == key then return kv[2] end
  end
end

---Check whether current line is the start of metadata block or not
---@param line string
---@return boolean: true if it's the start/end of metadata block
local is_block_delim = function(line)
  return vim.fn.match(line, [[\v^---\s*$]]) ~= -1
end

---Convert Lua value to Yaml value
---@return string
local yaml_value = (function ()
  local convert = {
    ['boolean'] = function (lua_value)
      return vim.inspect(lua_value) -- yah maybe overkill :D
    end,
    ['table'] = function(lua_value)
      if vim.tbl_islist(lua_value) then
       return ("[%s]"):format(table.concat(lua_value, ","))
      end
    end
  }
  return function (value)
    return convert(type(value))(value)
  end
end)

---Wrapper function for vim.fn.match for convenience.
---@param line string: line to match against
---@param pattern string: regex
---@return boolean: true if match
local match = function(line, pattern)
  return vim.fn.match(line, pattern) ~= -1
end

--- Read current buffer and dump yaml block lines into a list
---@return table: list of string
M.raw = function()
  if is_block_delim(vim.fn.getline(1)) then
    local res = {}
    local range = vim.fn.range(2, vim.fn.line('$'))

    for _, i in ipairs(range) do

      local line = vim.fn.getline(i)
      if match(line, [[\v^\s*$]]) then
        res[#res+1] = ''
      elseif is_block_delim(line) then
        return res
      end

      local match = vim.fn.matchlist(line, kv_pattern)
      if #match == 0 then
        return {}
      end
      res[#res+1] = match[1]

    end
  end

  return {}
end

--- Read current buffer and returns a metadata as list of key values pairs
---@return table: eg: { {"title", "README"}, {"tags", "foo"} }
M.decode = function()
  local res = {}
  local raw = M.raw()
  if #raw == 0 then return {} end

  for _, line in ipairs(raw) do
    local match = vim.fn.matchlist(line,kv_pattern)
    if #match ~= 0 then
      res[#res+1] = { match[2], match[3]  }
    end
  end

  return res
end

--- Encode lua table into yaml string
---@param metadata table: list of key-values pairs
---@return table: YAML string
M.encode = function(metadata)
  local res = {"---"}
  for _, kv in ipairs(metadata) do
    local key, value = kv[1], kv[2]
    if type(value) ~= "string" then
      value = yaml_value(value)
    end
    table.insert(res, ("%s: %s"):format(key, value))
  end
  table.insert(res, "---")
  return res
end

---Update title to match the filename (TODO: or the other way around)
---@param config table: file or user configuration
---@param path string: file path
---@param metadata table: file metadata
M.__update_title = function(config, path, metadata)
  --- TODO: Check if title is different from file name
  --- and if so update filename not fontmatter.
  if config.autotitle ~= 1 then return end
  local title = corpus.title_for_file(path)
  if #metadata ~= 0 then
    set_kv_list(metadata, "title", title)
  else
    metadata[#metadata+1] = {"title", title}
  end
end


---Update tags to contain user or configuration tags
---@param config table: file or user configuration
---@param path string: file path
---@param metadata table: file metadata
M.__update_tags = function(config, path, metadata)
  if not config.tags then return end
  local tags = vim.split(get_kv_list(metadata, "tags") or "", " ")

  for _, tag in ipairs(config.tags) do
    if vim.fn.index(tags, tag) == -1 then
      tags[#tags+1] = tag
    end
  end

  set_kv_list(metadata, "tags", tags)
end

M.__update_buf = function(metadata)
  local yaml = M.encode(metadata)
  local raw = M.raw()

  if #raw ~= 0 then
    vim.fn.deletebufline('', 1, #raw +2)
  end

  vim.fn.append(0, yaml)

end

---Main function in metadata module. It update title, tags and metadata
---@param path string: filepath
M.update = function(path)
  local config = corpus.config_for_file(path)
  if config.autotitle ~= 1 and not config.tags then return end

  local metadata = M.decode()

  M.__update_title(config, path, metadata)
  M.__update_tags(config, path, metadata)
  M.__update_buf(metadata)
end

return M
