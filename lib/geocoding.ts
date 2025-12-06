/**
 * 地理编码工具 - 使用腾讯地图API进行逆向地理编码
 * 将GPS坐标转换为可读的地址信息
 */

interface TencentMapGeocodingResponse {
  status: number;
  message: string;
  result?: {
    address: string;
    formatted_addresses?: {
      recommend?: string;
      rough?: string;
      standard_address?: string;
    };
    address_component: {
      nation: string;
      province: string;
      city: string;
      district: string;
      street: string;
      street_number: string;
    };
  };
}

/**
 * 从GPS坐标字符串解析经纬度
 * @param location GPS坐标字符串，格式: "纬度, 经度" 或 "lat, lng"
 * @returns {lat: number, lng: number} 或 null
 */
function parseLocation(location: string): { lat: number; lng: number } | null {
  try {
    const parts = location.split(',').map(s => s.trim());
    if (parts.length !== 2) return null;
    
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    
    return { lat, lng };
  } catch (error) {
    console.error('Failed to parse location:', error);
    return null;
  }
}

/**
 * 使用腾讯地图API进行逆向地理编码
 * @param location GPS坐标字符串，格式: "纬度, 经度"
 * @returns 解析后的地址字符串，失败时返回 null
 */
export async function reverseGeocode(location: string): Promise<string | null> {
  try {
    console.log('[GEOCODING] Starting reverseGeocode for:', location);
    
    // 解析坐标
    const coords = parseLocation(location);
    if (!coords) {
      console.warn('[GEOCODING] Invalid location format:', location);
      return null;
    }
    console.log('[GEOCODING] Parsed coordinates:', coords);

    // 获取API密钥
    const apiKey = process.env.TX_API_KEY;
    if (!apiKey) {
      console.error('[GEOCODING] TX_API_KEY not found in environment variables');
      return null;
    }
    console.log('[GEOCODING] API key found, length:', apiKey.length);

    // 构建请求URL
    // 注意：腾讯地图API格式为 location=lat,lng
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${coords.lat},${coords.lng}&key=${apiKey}`;
    console.log('[GEOCODING] Request URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));

    // 调用API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[GEOCODING] Response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('[GEOCODING] Tencent Map API request failed:', response.status, response.statusText);
      return null;
    }

    const data: TencentMapGeocodingResponse = await response.json();
    console.log('[GEOCODING] Response data:', JSON.stringify(data, null, 2));

    // 检查API响应状态
    if (data.status !== 0) {
      console.error('[GEOCODING] Tencent Map API error:', data.status, data.message);
      return null;
    }

    // 提取推荐地址
    // 优先使用 formatted_addresses.recommend，然后是 address
    const recommendedAddress = data.result?.formatted_addresses?.recommend;
    if (recommendedAddress) {
      console.log('[GEOCODING] Using recommended address:', recommendedAddress);
      return recommendedAddress;
    }

    // 如果没有推荐地址，使用标准地址
    const standardAddress = data.result?.address;
    if (standardAddress) {
      console.log('[GEOCODING] Using standard address:', standardAddress);
      return standardAddress;
    }

    console.warn('[GEOCODING] No address found in response');
    return null;
  } catch (error) {
    console.error('[GEOCODING] Reverse geocoding failed:', error);
    return null;
  }
}
