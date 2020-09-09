-- Copyright 2015-present Greg Hurrell. All rights reserved.
-- Licensed under the terms of the MIT license.

local util = {
  list = {},
}

util.list.clone = function(list)
  return {unpack(list)}
end

util.list.concat = function(list, other)
  local result = util.list.clone(list)
  for _, v in ipairs(other) do
    table.insert(result, v)
  end
  return result
end

-- see tbl_contains provided by neovim
util.list.includes = function(list, item)
  for _, v in ipairs(list) do
    if v == item then
      return true
    end
  end
  return false
end

util.list.map = function(list, cb)
  local result = {}
  for i, v in ipairs(list) do
    result[i] = cb(v)
  end
  return result
end

return util.list
