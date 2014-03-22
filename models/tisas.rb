# -*- coding: utf-8 -*-
class Tisa < Sequel::Model
  one_to_many :cpcs
  one_to_many :groups
end
