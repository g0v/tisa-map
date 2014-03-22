# -*- coding: utf-8 -*-
class Standards < Sequel::Model
  many_to_one :group
end
