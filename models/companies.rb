class Company < Sequel::Model
    set_primary_key :id
    one_to_many :categories
end