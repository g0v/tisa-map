# -*- coding: utf-8 -*-
class Keyword < Sequel::Model
  def get_value_type_url(url_helper)
    p url_helper
    keyword = self
    result = {}
    case keyword.type
      when "companies"
        row = Company[keyword.type_id]
        result[:value] = keyword.keyword
        result[:type] = "公司行號"
        result[:url] = url_helper.call('/company/'+row.taxid.to_s)
      when "categories"
        row = Category[keyword.type_id]
        result[:value] = keyword.keyword
        result[:type] = "營業登記項目"
        result[:url] = url_helper.call('/result?cat[]='+row.id.to_s)
      when "standards"
        row = Standard[keyword.type_id]
        result[:value] = keyword.keyword
        result[:type] = "行業標準分類"
        result[:url] = url_helper.call('/standard/'+row.id.to_s)
      when "standards_activities"
        row = Standard[keyword.type_id]
        result[:value] = keyword.keyword
        result[:type] = "經濟活動"
        result[:url] = url_helper.call('/standard/'+row.id.to_s)
    end
    result
  end
end
