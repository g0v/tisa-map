require_relative "../environments.rb"

DB.run "DROP INDEX IF EXISTS keyword_indices_token_position_idx;"

Keyword.each do |row|
  p row.id

  data = []

  token = row.keyword
  position = 0

  while token != ''
    data << {
      token: token.clone,
      position: position,
      keyword_id: row.id
    }
    
    position += 1
    token[0] = ''
  end

  DB[:keyword_indices].multi_insert(data)
end

DB.run '
  CREATE INDEX keyword_indices_token_position_idx
    ON keyword_indices
    USING btree
    (token COLLATE pg_catalog."default", "position");
'