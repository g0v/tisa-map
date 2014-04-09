# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :categories do
      primary_key :id
      column      :group_id,  Integer
      column      :key,       String
      column      :name,      String
    end
  end

  down do
    drop_table :categories
  end
end
