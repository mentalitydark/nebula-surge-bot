export type DirOptions = 'ASC' | 'DESC'

export type SearchInput<Model> = {
  page?: number
  per_page?: number
  sort?: (keyof Model) | null
  sort_dir?: DirOptions| null
  filter?: string | null
}

export type SearchOutput<Model> = {
  data: Model[]
  current_page: number
  per_page: number
  total: number
}

export interface RepositoryInterface<Model, T> {
  create(data: T): Model
  insert(model: Model): Promise<Model>
  search(props: SearchInput<Model>): Promise<SearchOutput<Model>>

  /** @throws {Error} */
  findById(id: number): Promise<Model>

  /** @throws {Error} */
  update(model: Model): Promise<Model>

  /** @throws {Error} */
  delete(id: number): Promise<void>
}