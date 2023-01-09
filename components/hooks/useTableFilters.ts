import { useState } from 'react'
import isValid from 'date-fns/isValid'
import format from 'date-fns/format'

export interface TableFilterDescriptor {
  label: string
  value: string | number | undefined
  inputType: undefined | 'date-range' | 'number-range'
  filterOptions?: TableFilterDescriptor[]
}

type FilterValue = string | number | undefined | Date | object | null

export interface TableFilter {
  name: string
  value: FilterValue
  description: string | null
}

export interface useTableFiltersInterface {
  filterOptions: TableFilterDescriptor[]
  activeFilters: TableFilter[]
  // TODO: Complete interface
  [x: string]: any
}

// TODO: Move to date utils file
const isValidDate = (date: any) => isValid(date)

// TODO: Date format must defaults by language and save in user's custom settings
// TODO: i18n "invalid date"
const formatDate = (date: any) => (isValidDate(date) ? format(date, 'dd/MM/yyyy') : 'invalid date')

export const useTableFilters = (availableFilters: TableFilterDescriptor[]) => {
  const [filters, setFilters] = useState<TableFilter[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedFilterValue, setSelectedFilterValue] = useState<FilterValue>(null)

  const filterTextDescription = (filter: TableFilterDescriptor) => {
    const { value: filterName, inputType } = filter
    // @ts-ignore
    const { from, to } = selectedFilterValue
    if (from && to) {
      return inputType === 'date-range'
        ? `${filterName}: ${formatDate(from)} - ${formatDate(to)}`
        : `${filterName}: ${from} - ${to}` // number-range
    }
    // TODO: i18n all "filterName" posible values (receive i18n namespace as hooj parameter)
    return `${filterName}: ${isValidDate(selectedFilterValue) ? formatDate(selectedFilterValue) : selectedFilterValue}`
  }

  const addFilter = () => {
    if (selectedFilter && selectedFilterValue !== null && selectedFilterValue !== undefined) {
      const filter = availableFilters.find(({ value }) => value === selectedFilter)
      if (filter) {
        const newFilter = {
          name: selectedFilter,
          value: selectedFilterValue,
          description: filterTextDescription(filter),
        }
        setFilters([...filters, newFilter])
        setSelectedFilter(null)
        setSelectedFilterValue(null)
        return true
      }
    }
    return false
  }

  const removeFilter = (filterName: string) => setFilters(filters.filter(({ name }) => name !== filterName))

  const clearFilters = () => setFilters([])

  const filterOptions = availableFilters.filter(
    availableFilter => !filters.filter(({ value }) => value).some(({ name }) => name === availableFilter.value)
  )

  const selected = availableFilters.find(({ value }) => value === selectedFilter)

  const selectedFilterOptions = selected && selected.filterOptions ? selected.filterOptions : null

  return {
    filterOptions,
    setSelectedFilter,
    selectedFilter: { ...selected, filterOptions: selectedFilterOptions },
    setSelectedFilterValue,
    selectedFilterValue,
    addFilter,
    removeFilter,
    clearFilters,
    activeFilters: filters,
  }
}
