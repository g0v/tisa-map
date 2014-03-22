# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :cpcs do
      primary_key :id
      column      :tisa_id,   Integer
      column      :key,       String
      column      :name,      String
    end
  end

  down do
    drop_table :cpcs
  end
end
