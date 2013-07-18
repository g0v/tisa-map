# -*- coding: UTF-8 -*-
Sequel.migration do
    change do
        create_table :companies, :charset => :utf8 do
            primary_key :id
            Integer     :number,        :null => false
            String      :name,          :null => false
            String      :location,      :null => false
            String      :business,      :null => false
            Integer     :latitude,      :null => false
            Integer     :longitude,     :null => false
        end
    end
end
