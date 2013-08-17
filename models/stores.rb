class Store < Sequel::Model

    Sequel::Plugins::JsonSerializer.configure(
        self,
        :include => [:geography],
        :except  => [:location]
    )

    def geography
        Oj.load(location)
    end

end
