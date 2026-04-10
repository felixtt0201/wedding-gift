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
          tableNumber: (row['桌次'] || row['tableNumber'] || '').trim(),
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
