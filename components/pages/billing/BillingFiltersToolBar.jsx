import React, { useState, useEffect } from 'react'
import isBefore from 'date-fns/isBefore'
import { Button } from 'antd'
import { Chip, ChipClose } from '../../ui-elements/chip'
import { DatePicker, Input, InputGroup, Form, Label, Select } from '../../ui-elements/forms'
import { Modal, ModalContent } from '../../ui-elements/modal'
import { Text } from '../../ui-elements/text'
import { ToolBar } from '../../ui-elements/tool-bar'
import { ToolBarSection } from '../../ui-elements/tool-bar-section/index.ts'
import { ToolBarDivider } from '../../ui-elements/tool-bar-divider'
import { VerticalExpandable } from '../../ui-elements/vertical-expandable'
import { i18n } from '../../../services/i18n'

const useSelectDateRange = () => {
  const [from, setFrom] = useState(0)
  const [enteredTo, setEnteredTo] = useState(null)
  const [to, setTo] = useState(null)

  const isSelectingFirstDay = date => {
    const isBeforeFirstDay = from && isBefore(date, from)
    const isRangeSelected = from && to
    return !from || isBeforeFirstDay || isRangeSelected
  }

  const handleDateClick = date => {
    if (from && to && date >= from && date <= to) {
      setFrom(0)
      setEnteredTo(null)
      setTo(null)
      return
    }
    if (isSelectingFirstDay(date)) {
      setFrom(date)
      setTo(null)
      setEnteredTo(null)
    } else {
      setTo(date)
      setEnteredTo(date)
    }
  }

  return { from, to: enteredTo, handleDateClick }
}

const editFilter = show => <Button onClick={() => show()}>Editar filtros</Button>

const contentFilter = (hide, clearFilters, addFilter, filterOptions, setSelectedFilter, selectedFilter, renderFilterValueComponent) => (
  <ModalContent>
    <ToolBar>
      {/* TODO: FIX: Additional ToolBarSection is required to make the second one textAlign="right" works */}
      <ToolBarSection />
      <ToolBarSection textAlign="right">
        <Button color="subtle" onClick={() => hide()}>
          Cerrar
        </Button>
        <Button
          color="subtle"
          onClick={() => {
            clearFilters()
            hide()
          }}
        >
          Borrar filtros
        </Button>
        <Button color="default" onClick={() => addFilter()}>
          Agregar
        </Button>
      </ToolBarSection>
    </ToolBar>

    <Form formType="horizontal">
      <InputGroup>
        <Label color="inverse">
          <Text>Campo</Text>
        </Label>
        <Select options={filterOptions} onChange={selected => setSelectedFilter(selected.value)} value={selectedFilter} />
      </InputGroup>
      {renderFilterValueComponent()}
    </Form>
  </ModalContent>
)

const FilterSelectionModalForm = ({ filters }) => {
  const { filterOptions, setSelectedFilter, selectedFilter, setSelectedFilterValue, selectedFilterValue, addFilter, clearFilters } = filters
  const { from, to, handleDateClick } = useSelectDateRange()
  const [selectedDates, setSelectedDates] = useState([from, { from, to }])
  useEffect(() => {
    setSelectedDates([from, { from, to }])
    setSelectedFilterValue({ from, to })
  }, [from, to])

  const renderFilterValueComponent = () => {
    if (!selectedFilter) {
      return null
    }

    if (selectedFilter.inputType === 'date') {
      return (
        <InputGroup>
          <Label color="inverse">
            <Text>Fecha</Text>
          </Label>
          <DatePicker onDayClick={date => setSelectedFilterValue(date)} selectedDays={selectedFilterValue} locale="es" fixedWeeks />
        </InputGroup>
      )
    }

    if (selectedFilter.inputType === 'date-range') {
      return (
        <InputGroup>
          <Label color="inverse">
            <Text>Rango de fechas</Text>
          </Label>
          <DatePicker
            onDayClick={handleDateClick}
            selectedDays={selectedDates}
            locale="es"
            fixedWeeks
            className="Range"
            numberOfMonths={1}
          />
        </InputGroup>
      )
    }

    if (selectedFilter.inputType === 'number-range') {
      return (
        <>
          <InputGroup>
            <Label color="inverse">
              <Text>Desde</Text>
            </Label>
            <Input
              color="default"
              style={{ width: '80px' }}
              onChange={({ target }) => {
                setSelectedFilterValue(selectedFilterValue ? { ...selectedFilterValue, from: target.value } : { from: target.value })
              }}
            />
          </InputGroup>
          <InputGroup>
            <Label color="inverse">
              <Text>Hasta</Text>
            </Label>
            <Input
              color="default"
              style={{ width: '80px' }}
              onChange={({ target }) => {
                setSelectedFilterValue(selectedFilterValue ? { ...selectedFilterValue, to: target.value } : { to: target.value })
              }}
            />
          </InputGroup>
        </>
      )
    }

    return selectedFilter.filterOptions ? (
      <InputGroup>
        <Label color="inverse">
          <Text>Valor</Text>
        </Label>
        <Select isCreatable options={selectedFilter.filterOptions} onChange={selected => setSelectedFilterValue(selected.value)} />
      </InputGroup>
    ) : (
      <InputGroup>
        <Label color="inverse">
          <Text>Valor</Text>
        </Label>
        <Input
          color="default"
          onChange={({ target }) => {
            setSelectedFilterValue(target.value)
          }}
        />
      </InputGroup>
    )
  }

  return (
    <Modal
      toggle={show => editFilter(show)}
      content={hide => contentFilter(hide, clearFilters, addFilter, filterOptions, setSelectedFilter, selectedFilter, renderFilterValueComponent)}
    />
  )
}

export const BillingFiltersToolBar = ({ filters }) => {
  const { removeFilter, activeFilters } = filters

  const collapseState = 'expanded'

  return (
    <VerticalExpandable key="bar" expandedHeight={148} collapseState={collapseState}>
      <ToolBar color="none" height="auto" scrollX>
        <ToolBarSection>
          {activeFilters.map(({ name, description }) => (
            <Chip key={name}>
              <span>{description}</span>
              <ChipClose onClick={() => removeFilter(name)} />
            </Chip>
          ))}
        </ToolBarSection>
        <ToolBarDivider />
        <ToolBarSection textAlign="right">
          <FilterSelectionModalForm filters={filters} />
        </ToolBarSection>
      </ToolBar>
    </VerticalExpandable>
  )
}
