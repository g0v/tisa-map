# -*- coding: utf-8 -*-
class KeywordIndex < Sequel::Model
  many_to_one :keyword
end
