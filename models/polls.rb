# -*- coding: utf-8 -*-
class Poll < Sequel::Model
    plugin :timestamps, :update_on_create => true
end
