# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :polls do
      primary_key :id
      column      :type,        Integer
      column      :ip,          String
      column      :created_at,  Time
      column      :updated_at,  Time
    end
  end

  down do
    drop_table :polls
  end
end
