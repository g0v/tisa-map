# -*- coding: utf-8 -*-
class Category < Sequel::Model
  many_to_one :group
end
