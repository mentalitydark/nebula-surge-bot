import { NotFoundError } from "#errors"

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

  /** @throws {NotFoundError} */
  findById(id: number): Promise<Model>

  /** @throws {NotFoundError} */
  update(model: Model): Promise<Model>

  /** @throws {NotFoundError} */
  delete(id: number): Promise<void>
}