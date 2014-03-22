# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :standards do
      primary_key :id
      column      :group_id,      Integer
      column      :key,           String
      column      :description,   String,     text: true
      column      :activities,    "text[]"
    end
  end

  down do
    drop_table :standards
  end
end
