import { type TypeResponse } from './types/enums/TypeResponse'

export const mapToRespose = (data: any, type: TypeResponse): string => {
  const result = JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0
  })
  console.log('resul sent')
  console.log(result)
  return result
}
