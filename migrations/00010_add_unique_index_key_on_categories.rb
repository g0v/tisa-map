# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    add_index :categories, :key,  unique: true
  end

  down do
    drop_index :categories, :key
  end
end
