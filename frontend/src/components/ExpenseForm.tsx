/**
 * Form component for adding/editing expenses
 */

import React, { useEffect, useState } from "react";
import { Category, ExpenseFormData } from "../types";
import { fetchCategories } from "../services/api";
import { TextField, SelectBox, Button } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { AddCategoryButton } from "./AddCategoryButton";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryLoadError, setCategoryLoadError] = useState("");

  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });

  useEffect(() => {
    void loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      setCategoryLoadError("");
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoryLoadError("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const categoryHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
  };

  const categoryLabelStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 600,
  };

  const helperTextStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "#6b7280",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  const canSubmit = !isLoadingCategories && !categoryLoadError;

  const categoryField = (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={categoryHeaderStyle}>
        <span style={categoryLabelStyle}>Category</span>
        <AddCategoryButton
          buttonSize="small"
          onCategoryCreated={(createdCategory) => {
            setCategories((prev) =>
              [...prev, createdCategory].sort((a, b) => a.name.localeCompare(b.name)),
            );
            handleChange("category", createdCategory.name);
          }}
        />
      </div>
      <SelectBox
        options={categoryOptions}
        value={formData.category}
        onChange={(e) => handleChange("category", e.target.value)}
        error={errors.category || categoryLoadError}
        fullWidth
        required
        disabled={isLoadingCategories || !!categoryLoadError}
      />
      {isLoadingCategories && (
        <span style={helperTextStyle}>Loading categories...</span>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <TextField
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        error={errors.amount}
        fullWidth
        required
      />

      <TextField
        label="Description"
        type="text"
        placeholder="Enter description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={errors.description}
        fullWidth
        required
      />

      {categoryField}

      <TextField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => handleChange("date", e.target.value)}
        error={errors.date}
        fullWidth
        required
      />

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !canSubmit}
          fullWidth
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
