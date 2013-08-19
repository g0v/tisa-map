class Store < Sequel::Model

    Sequel::Plugins::JsonSerializer.configure(
        self,
        :include => [:geography],
        :except  => [:location]
    )

    def geography
        location ? Oj.load(location) : ""
    end

end
