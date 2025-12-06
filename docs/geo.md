url = https://apis.map.qq.com/ws/geocoder/v1/?location=

请求参数
参数	必填	说明	示例
key	是	开发密钥（Key）	key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-*****
location	是	经纬度（GCJ02坐标系），格式：
location=lat<纬度>,lng<经度>	location= 39.984154,116.307490
radius	否	解析行政区划的吸附半径，如入参经纬度在近海海域（未在任何行政区划内），可设置此参数解析返回在该半么范围内最近的行政区划信息。
单位米，默认0，最大设置5000	radius=1000
get_poi	否	是否返回周边地点（POI）列表，可选值：
0 不返回(默认)
1 返回	get_poi=1
poi_options	否	周边POI（AOI）列表控制参数：
1.返回短地址，缺省时返回长地址
poi_options=address_format=short
2. 半径，取值范围 1-5000（米）
poi_options=radius=5000
3. 控制返回场景，
poi_options=policy=1/2/3/4/5
policy=1[默认] 以地标+主要的路+近距离POI为主，着力描述当前位置；
policy=2 到家场景：筛选合适收货的POI，并会细化收货地址，精确到楼栋；
policy=3 出行场景：过滤掉车辆不易到达的POI(如一些景区内POI)，增加道路出入口、交叉口、大区域出入口类POI，排序会根据真实API大用户的用户点击自动优化。
policy=4 社交签到场景，针对用户签到的热门 地点进行优先排序。
policy=5 位置共享场景，用户经常用于发送位置、位置分享等场景的热门地点优先排序
注：policy=1/2/3最多返回10条周边POI，policy=4/5最多返回20条，
4. 按距离排序
poi_options=orderby=_distance，开启POI距离排序
注：仅在policy=1/2/3时生效
5. 返回POI附加字段：
added_fields=字段1,字段2,…
可同时指定多个字段，逗号分隔，支持：
is_aoi 是否为aoi：1是（即该POI包含轮廓边界），0否
category_code 分类代码（仅policy=1/2/3时、及无poi分类筛选时支持）	【单个参数写法示例】：
poi_options=address_format=short
【多个参数英文分号间隔，写法示例】：
poi_options=address_format=short;radius=5000;policy=2;orderby=_distance
output	否	返回格式：支持JSON/JSONP，默认JSON	output=json
callback	否	JSONP方式回调函数	callback=function1
响应结果
名称	类型	必有	说明
status	number	是	状态码，0为正常，其它为异常，详细请参阅状态码说明
message	string	是	状态说明
request_id	string	是	本次请求的唯一标识
result	object	是	逆地址解析结果
address	string	是	以行政区划+道路+门牌号等信息组成的标准格式化地址
formatted_addresses	object	否	结合知名地点形成的描述性地址，更具人性化特点
recommend	string	否	推荐使用的地址描述，描述精确性较高
rough	string	否	粗略位置描述
standard_address	string	否	基于附近关键地点（POI）的精确地址
address_component	object	是	地址部件，address不满足需求时可自行拼接
nation	string	是	国家
province	string	是	省
city	string	是	市，如果当前城市为省直辖县级区划，city与district字段均会返回此城市
注：省直辖县级区划adcode第3和第4位分别为9、0，如济源市adcode为419001
district	string	否	区，可能为空字串
street	string	否	道路，可能为空字串
street_number	string	否	门牌，可能为空字串
ad_info	object	是	行政区划信息
nation_code	string	是	国家代码（ISO3166标准3位数字码）
adcode	string	是	行政区划代码，规则详见：行政区划代码说明
city_code	string	是	城市代码，由国家码+行政区划代码（提出城市级别）组合而来，总共为9位
phone_area_code	string	否	城市电话区号
name	string	是	行政区划名称
location	object	是	行政区划中心点坐标
lat	number	是	纬度
lng	number	是	经度
nation	string	是	国家
province	string	是	省 / 直辖市
city	string	是	市 / 地级区 及同级行政区划，如果当前城市为省直辖县级区划，city与district字段均会返回此城市
注：省直辖县级区划adcode第3和第4位分别为9、0，如济源市adcode为419001
district	string	否	区 / 县级市 及同级行政区划
address_reference	object	否	坐标相对位置参考
famous_area	object	否	知名区域，如商圈或人们普遍认为有较高知名度的区域
id	string	是	地点唯一标识
title	string	否	名称/标题
location	object	否	坐标
lat	number	否	纬度
lng	number	否	经度
_distance	number	否	此参考位置到输入坐标的直线距离
_dir_desc	string	否	此参考位置到输入坐标的方位关系，如：北、南、内
business_area	object	否	商圈，目前与famous_area一致
town	object	否	乡镇/街道（四级行政区划）
id	string	是	乡镇/街道唯一标识（行政区划代码adcode）
title	string	否	名称/标题
location	object	否	坐标
lat	number	否	纬度
lng	number	否	经度
_distance	number	否	此参考位置到输入坐标的直线距离
_dir_desc	string	否	此参考位置到输入坐标的方位关系，如：北、南、内
landmark_l1	object	否	一级地标，可识别性较强、规模较大的地点、小区等
【注】对象结构同 famous_area
landmark_l2	object	否	二级地标，较一级地标更为精确，规模更小
【注】：对象结构同 famous_area
street	object	否	道路【注】：对象结构同 famous_area
street_number	object	否	门牌 【注】：对象结构同 famous_area
crossroad	object	否	交叉路口 【注】：对象结构同 famous_area
water	object	否	水系 【注】：对象结构同 famous_area
ocean	object	否	海洋信息
id	string	否	海洋唯一标识
title	string	否	海洋名称
poi_count	number		查询的周边poi的总数，仅在传入参数get_poi=1时返回
pois	array	否	周边地点（POI/AOI）列表，数组中每个子项为一个POI/AOI对象
说明：POI即地点，如一个便利店，往往因其面积较小，其位置一般仅会标为为一个点，而学校、小区等往往面积较大，通常会有一定的地理范围，即所谓AOI，如果所请求的经纬度在AOI内，其距离会为0，且方位描述为“内”，如果是一个面积较小的地点，或不在AOI内，距离会>0，方位描述会为具体方位词，如“东”
id	string	否	地点（POI）唯一标识
title	string	否	名称
address	string	否	地址
category	string	否	地点分类信息
location	object	否	提示所述位置坐标
lat	number	否	纬度
lng	number	否	经度
ad_info	object	否	行政区划信息
adcode	number	是	行政区划代码
province	string	否	省
city	string	否	市，如果当前城市为省直辖县级区划，city与district字段均会返回此城市
注：省直辖县级区划adcode第3和第4位分别为9、0，如济源市adcode为419001
district	string	否	区
_distance	number	否	该POI/AOI到逆地址解析传入的坐标的直线距离
_dir_desc	string	否	该POI/AOI在逆地址解析传入的坐标的相对方位描述，包括：东、东南、南、西南、西、西北、北、东北、内（输入经纬度在AOI范围内）
调