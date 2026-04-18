import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParticipantSetup } from "../components/ParticipantSetup";
import { createMockWordBank, mockTopics } from "./helpers/mockWordBank";

describe("ParticipantSetup", () => {
  const mockWordBank = createMockWordBank();

  beforeEach(() => {
    localStorage.clear();
  });

  describe("participant counter", () => {
    it("shows participant counter with + and - buttons", () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);
      expect(
        screen.getByRole("button", { name: /increase participants/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /decrease participants/i }),
      ).toBeInTheDocument();
    });

    it("increases participant count when clicking +", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      await user.click(
        screen.getByRole("button", { name: /increase participants/i }),
      );

      expect(screen.getByText(/1 participant$/i)).toBeInTheDocument();
    });

    it("decreases participant count when clicking -", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      await user.click(
        screen.getByRole("button", { name: /increase participants/i }),
      );
      await user.click(
        screen.getByRole("button", { name: /increase participants/i }),
      );
      await user.click(
        screen.getByRole("button", { name: /decrease participants/i }),
      );

      expect(screen.getByText(/1 participant$/i)).toBeInTheDocument();
    });

    it("shows participant count", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      await user.click(
        screen.getByRole("button", { name: /increase participants/i }),
      );
      await user.click(
        screen.getByRole("button", { name: /increase participants/i }),
      );

      expect(screen.getByText(/2 participants/i)).toBeInTheDocument();
    });

    it("disables - button at 0 participants", () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);
      expect(
        screen.getByRole("button", { name: /decrease participants/i }),
      ).toBeDisabled();
    });

    it("limits maximum participants to 20", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      for (let i = 0; i < 20; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }

      expect(
        screen.getByRole("button", { name: /increase participants/i }),
      ).toBeDisabled();
    });
  });

  describe("start button", () => {
    it("disables start button with no participants", () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);
      expect(screen.getByRole("button", { name: /start/i })).toBeDisabled();
    });

    it("disables start button with only 1 participant", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      await user.click(
        screen.getByRole("button", { name: /increase participants/i }),
      );

      expect(screen.getByRole("button", { name: /start/i })).toBeDisabled();
    });

    it("disables start button with only 2 participants", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      for (let i = 0; i < 2; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }

      expect(screen.getByRole("button", { name: /start/i })).toBeDisabled();
    });

    it("enables start button with 3 or more participants", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      for (let i = 0; i < 3; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }

      expect(screen.getByRole("button", { name: /start/i })).toBeEnabled();
    });

    it("calls onStart with participant count, impostor count, and topic when clicked", async () => {
      const user = userEvent.setup();
      const onStart = vi.fn();
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />);

      for (let i = 0; i < 3; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }
      await user.click(screen.getByRole("button", { name: /start/i }));

      expect(onStart).toHaveBeenCalledWith({
        participantCount: 3,
        impostorCount: 1,
        topicId: expect.any(String),
        randomImpostorCount: false,
      });
    });
  });

  describe("random impostor count", () => {
    it("passes randomImpostorCount: false by default", async () => {
      const user = userEvent.setup();
      const onStart = vi.fn();
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />);

      for (let i = 0; i < 3; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }
      await user.click(screen.getByRole("button", { name: /start/i }));

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ randomImpostorCount: false }),
      );
    });

    it("passes randomImpostorCount: true when checkbox is checked", async () => {
      const user = userEvent.setup();
      const onStart = vi.fn();
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />);

      for (let i = 0; i < 4; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }

      await user.click(screen.getByRole("checkbox", { name: /random/i }));
      await user.click(screen.getByRole("button", { name: /start/i }));

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ randomImpostorCount: true }),
      );
    });
  });

  describe("topic selection", () => {
    it("shows topic selector", () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);
      expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    });

    it("allows changing topic", async () => {
      const user = userEvent.setup();
      const onStart = vi.fn();
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />);

      for (let i = 0; i < 3; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }

      await user.selectOptions(screen.getByRole("combobox"), "transportation");
      await user.click(screen.getByRole("button", { name: /start/i }));

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ topicId: "transportation" }),
      );
    });

    it("displays all available topics from word bank", () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      mockTopics.forEach((topic) => {
        expect(
          screen.getByRole("option", { name: topic.title }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("impostor counter integration", () => {
    it("shows impostor counter when there are 2+ participants", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      for (let i = 0; i < 2; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }

      expect(screen.getByText(/impostors/i)).toBeInTheDocument();
    });

    it("does not show impostor counter with less than 2 participants", () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);
      expect(screen.queryByText(/impostors/i)).not.toBeInTheDocument();
    });

    it("passes correct impostor count to onStart", async () => {
      const user = userEvent.setup();
      const onStart = vi.fn();
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />);

      for (let i = 0; i < 6; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }

      await user.click(
        screen.getByRole("button", { name: /increase impostors/i }),
      );
      await user.click(screen.getByRole("button", { name: /start/i }));

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ participantCount: 6, impostorCount: 2 }),
      );
    });

    it("auto-adjusts impostor count when decreasing participants makes it invalid", async () => {
      const user = userEvent.setup();
      const onStart = vi.fn();
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />);

      for (let i = 0; i < 6; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }

      // Set impostors to 3 (max for 6 participants)
      await user.click(
        screen.getByRole("button", { name: /increase impostors/i }),
      );
      await user.click(
        screen.getByRole("button", { name: /increase impostors/i }),
      );

      // Decrease to 4 participants (max impostors = 2)
      await user.click(
        screen.getByRole("button", { name: /decrease participants/i }),
      );
      await user.click(
        screen.getByRole("button", { name: /decrease participants/i }),
      );

      await user.click(screen.getByRole("button", { name: /start/i }));

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ participantCount: 4, impostorCount: 2 }),
      );
    });

    it("disables start button when decreasing participants below minimum", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      for (let i = 0; i < 3; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }

      expect(screen.getByRole("button", { name: /start/i })).toBeEnabled();

      await user.click(
        screen.getByRole("button", { name: /decrease participants/i }),
      );

      expect(screen.getByRole("button", { name: /start/i })).toBeDisabled();
    });

    it("clamps impostor count to valid range when participants change", async () => {
      const user = userEvent.setup();
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />);

      for (let i = 0; i < 6; i++) {
        await user.click(
          screen.getByRole("button", { name: /increase participants/i }),
        );
      }
      // Set impostors to 2
      await user.click(
        screen.getByRole("button", { name: /increase impostors/i }),
      );

      // Decrease to 2 participants (max impostors = 1)
      for (let i = 0; i < 4; i++) {
        await user.click(
          screen.getByRole("button", { name: /decrease participants/i }),
        );
      }

      // Counter should show 1 (clamped)
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });
});
