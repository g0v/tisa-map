# -*- coding: utf-8 -*-
Sequel.migration do
  change do
    add_column :categories, :note, "json", default: '{}'
  end
end
