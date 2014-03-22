# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    create_table :groups do
      primary_key :id
      column      :tisa_id,   Integer
    end
  end

  down do
    drop_table :groups
  end
end
