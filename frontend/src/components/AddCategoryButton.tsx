import React, { useState } from "react";
import { createCategory } from "../services/api";
import { Category } from "../types";
import { Button, Modal, TextField } from "../vibes";

interface AddCategoryButtonProps {
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary" | "danger" | "success";
  buttonSize?: "small" | "medium" | "large";
  modalTitle?: string;
  onCategoryCreated?: (category: Category) => void;
}

export function AddCategoryButton({
  buttonLabel = "Add Category",
  buttonVariant = "secondary",
  buttonSize = "medium",
  modalTitle = "Add Category",
  onCategoryCreated,
}: AddCategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1rem",
    justifyContent: "flex-end",
  };

  const closeModal = (force = false) => {
    if (isSubmitting && !force) return;
    setIsOpen(false);
    setName("");
    setError("");
  };

  const handleCreateCategory = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const category = await createCategory(trimmedName);
      onCategoryCreated?.(category);
      closeModal(true);
    } catch (submitError) {
      console.error("Error creating category:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create category",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setIsOpen(true)}
      >
        {buttonLabel}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={modalTitle}
        maxWidth="420px"
      >
        <div>
          <TextField
            label="Category Name"
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) {
                setError("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreateCategory();
              }
            }}
            error={error}
            fullWidth
            required
          />
          <div style={buttonGroupStyle}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => closeModal()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isSubmitting}
              onClick={() => void handleCreateCategory()}
            >
              {isSubmitting ? "Saving..." : "Create Category"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
