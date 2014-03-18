# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :companies do
      primary_key :id
      column      :location,    "geometry(Point, 4326)"
      column      :taxid,       String,     null: false,    unique: true,   size: 8,    fixed: true,    index: true
      column      :name,        String,     size: 128
      column      :address,     String,     text: true
      column      :categories,  "text[]",   null: false
      column      :status,      String,     size: 128
      column      :owner,       String,     size: 128
    end
  end

  down do
    drop_table :companies
  end
end
