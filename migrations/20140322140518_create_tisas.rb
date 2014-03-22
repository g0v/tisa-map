# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :tisas do
      primary_key :id
      column      :articles,    "json"
    end
  end

  down do
    drop_table :tisas
  end
end
