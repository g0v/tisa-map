# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :companies do
      primary_key :id
      column      :location,    "geometry(Point, 4326)"
      column      :taxid,       String,     null: false,    size: 8,      fixed: true
      column      :name,        String,     null: false,    size: 128
      column      :address,     String,     null: false,    text: true
      column      :categoies,   "text[]",   null: false
      column      :status,      String,     null: false,    size: 128
      column      :owner,       String,     null: false,    size: 128
    end
  end

  down do
    drop_table :companies
  end
end
