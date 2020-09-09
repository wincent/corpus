-- Copyright 2015-present Greg Hurrell. All rights reserved.
-- Licensed under the terms of the MIT license.

local util = {
  dict = {},
}

-- see tbl_keys utility from Neovim
util.dict.keys = function(dict)
  local result = {}
  for key, _ in pairs(dict) do
    table.insert(result, key)
  end
  return result
end

return util.dict
