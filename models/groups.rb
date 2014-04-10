# -*- coding: utf-8 -*-
class Group < Sequel::Model
  many_to_one :tisa
  one_to_many :standards
  one_to_many :categories
end
