# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :companies do
      primary_key :id
      column      :name,        String,     null: false
      column      :status,      String,     null: false
      column      :owner,       String,     null: false
      column      :categoies,   "text[]",   null: false
    end
  end

  down do
  end
end
