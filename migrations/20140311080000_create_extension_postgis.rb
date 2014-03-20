# -*- coding: utf-8 -*-
Sequel.migration do
  up do
    run "create extension postgis;"
  end

  down do
    run "drop extension postgis;"
  end
end
