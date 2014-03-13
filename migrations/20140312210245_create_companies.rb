# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :companies do
      primary_key :id
    # column      :location,    geometry(Point, 4326)
      column      :name,        String,     null: false
      column      :taxid,       String,     null: false
      column      :address,     String,     null: false
      column      :categoies,   "text[]",   null: false
      column      :status,      String,     null: false
      column      :owner,       String,     null: false
    end
  end

  down do
  end
end
