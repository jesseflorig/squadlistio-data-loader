import {zipObject} from 'lodash'

// convert to ISO 8601 format
const convertToDateTimeString = (str) => new Date(Date.parse(str)).toISOString()

// create products
const createProduct = async (product: Product, client: Client) => {
  const {id: oldId, name, image, thumb, wave, released = false, contents = {}, sku, release_date: releaseDate, announcement_date: announceDate} = product
  const releaseDateFix = releaseDate ? `releaseDate: "${convertToDateTimeString(releaseDate)}",` : ''
  const announceDateFix = announceDate ? `announceDate: "${convertToDateTimeString(announceDate)}",` : ''
  const result = await client.mutate(`{
    product: createProduct(
      oldId: ${oldId},
      name: "${name.replace(/"/g, '&quote;')}",
      image: "${image}",
      thumb: "${thumb}",
      wave: "${wave}",
      released: ${released},
      sku: "${sku}",
      ${releaseDateFix}
      ${announceDateFix}
    ){
      id
    }
  }`)

  if(!result) {
    console.log(`Failed to add ${name}: ${product}`)
  }
  // else {
  //   console.log(`Added ${name}`)
  // }

  return result.product.id
}

const findProduct = async (product: Product, client: Client) => {
  const {id: oldId} = product
  const result = await client.query(`{
    allProducts(
      filter: {
        oldId: ${oldId}
      }
    ) {
      id
    }
  }`)

  return result
}

export const createProducts = async (rawProducts: Product[], client: Client): Promise<IdMap> => {
  const productIds = await Promise.all(rawProducts.map( async(product) => {

    // check if product already exists
    const existingProduct = await findProduct(product, client)

    // if product doesn't exist, create it
    if (existingProduct.allProducts.length === 0) {
      return await createProduct(product, client)
    } else {
      return existingProduct.allProducts[0].id
    }
  }))

  return zipObject(rawProducts.map(product => product.id), productIds)
}
