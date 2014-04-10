# -*- coding: utf-8 -*-
class Standard < Sequel::Model
  many_to_one :group
end
