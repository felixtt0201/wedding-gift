import Papa from 'papaparse'

export function parseGuestCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete({ data, errors }) {
        if (errors.length) {
          reject(new Error('CSV 解析錯誤：' + errors[0].message))
          return
        }
        const guests = data.map(row => ({
          name: (row['名稱'] || row['name'] || '').trim(),
          needsCake: ['是', 'yes', 'true', '1'].includes(
            (row['需要禮餅'] || row['needsCake'] || '').trim().toLowerCase()
          ),
          cakeReceived: false,
          giftMoney: 0,
          absent: false
        })).filter(g => g.name)
        resolve(guests)
      },
      error(err) {
        reject(new Error(err.message))
      }
    })
  })
}

// 解析賓客清單：每行「名字」或「名字,桌號」，可選標題列
export function parseNameList(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const rows = e.target.result
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && !/^(名稱|name)/i.test(l))
      const guests = rows.map(l => {
        const [name, tableNumber = ''] = l.split(',').map(s => s.trim())
        return { name, tableNumber }
      }).filter(g => g.name)
      resolve(guests)
    }
    reader.onerror = () => reject(new Error('讀取檔案失敗'))
    reader.readAsText(file)
  })
}
