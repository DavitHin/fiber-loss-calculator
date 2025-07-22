# -*- coding: utf-8 -*-
"""
Fiber Optic Link Loss Budget GUI Calculator
Version: 5.1 (Debugged)
Date: 2025-07-21
Author: Gemini (AI Assistant)

Enhancements:
- Fixed font controls to prevent them from resizing.
- Verified and corrected URLs in the Readme, and added optional references.
"""
import tkinter as tk
from tkinter import ttk, messagebox, font as tkfont
from tkinter.scrolledtext import ScrolledText
import webbrowser
import os
try:
    from PIL import Image, ImageTk
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# --- Data Store (Same as before) ---
FIBER_STANDARDS = {
    'OS2': {
        'name': 'Single-Mode (ITU-T G.652.D)', 'max_distance_m': 10000,
        'wavelengths': {'1310nm': {'max_attenuation_db_km': 0.4, 'typical_attenuation_db_km': 0.35}, '1550nm': {'max_attenuation_db_km': 0.3, 'typical_attenuation_db_km': 0.22}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.05}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.25}
    },
    'OM3': {
        'name': 'Multimode OM3', 'max_distance_m': 300,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}
    },
    'OM4': {
        'name': 'Multimode OM4', 'max_distance_m': 400,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.5}, '1300nm': {'max_attenuation_db_km': 1.5, 'typical_attenuation_db_km': 0.8}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}
    },
    'OM5': {
        'name': 'Multimode OM5', 'max_distance_m': 440,
        'wavelengths': {'850nm': {'max_attenuation_db_km': 3.0, 'typical_attenuation_db_km': 2.4}, '953nm': {'max_attenuation_db_km': 2.2, 'typical_attenuation_db_km': 1.9}},
        'splice_loss': {'max_db': 0.3, 'typical_db': 0.1}, 'connector_loss': {'max_db': 0.75, 'typical_db': 0.3}
    }
}

class LossCalculatorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Advanced Fiber Optic Loss Budget Calculator")
        self.root.geometry("1024x640")

        self.font_size_var = tk.IntVar(value=10)
        self.font_family = "Hanuman" if "Hanuman" in tkfont.families() else "Segoe UI"
        self.is_dark_mode = tk.BooleanVar(value=False)
        self.font_size_var.trace_add("write", self.update_font_from_slider)

        self.setup_styles()
        self.create_widgets()
        self.apply_theme_and_font()

    def setup_styles(self):
        self.style = ttk.Style()
        self.light_theme = {"bg": "#F0F0F0", "fg": "#000000", "entry_bg": "#FFFFFF", "text_bg": "#FFFFFF", "header_fg": "#003399", "link_fg": "#0000EE"}
        self.dark_theme = {"bg": "#2E2E2E", "fg": "#FFFFFF", "entry_bg": "#3C3C3C", "text_bg": "#1E1E1E", "header_fg": "#569CD6", "link_fg": "#6CB4EE"}

    def apply_theme_and_font(self):
        theme = self.dark_theme if self.is_dark_mode.get() else self.light_theme
        font_size = self.font_size_var.get()
        
        # Fonts for content that will resize
        content_font_base = (self.font_family, font_size)
        content_font_bold = (self.font_family, font_size, 'bold')
        content_font_h1 = (self.font_family, font_size + 2, 'bold')
        content_font_h2 = (self.font_family, font_size + 1, 'bold')
        
        # Static fonts for controls that should NOT resize
        control_font_base = (self.font_family, 10)
        control_font_bold = (self.font_family, 10, 'bold')

        self.root.config(bg=theme["bg"])
        self.style.theme_use('clam')
        
        # Configure styles for controls (fixed size)
        self.style.configure('TButton', font=control_font_bold)
        self.style.configure('TCheckbutton', background=theme["bg"], foreground=theme["fg"], font=control_font_base)
        self.style.configure('Control.TLabel', background=theme["bg"], foreground=theme["fg"], font=control_font_base)
        
        # Configure styles for content (dynamic size)
        self.style.configure('Content.TLabel', background=theme["bg"], foreground=theme["fg"], font=content_font_base)
        self.style.configure('TNotebook', background=theme["bg"], borderwidth=0)
        self.style.configure('TNotebook.Tab', font=control_font_bold, padding=[10, 5])
        self.style.configure('TLabelframe', background=theme["bg"])
        self.style.configure('TLabelframe.Label', background=theme["bg"], foreground=theme["fg"], font=content_font_h2)
        
        # Manually apply to widgets that need specific fonts
        for widget in self.input_labels:
            widget.config(font=content_font_base)

        # Apply to text widgets and their tags
        for text_widget in [self.calc_output_text, self.instr_text]:
            if text_widget:
                text_widget.config(background=theme["text_bg"], foreground=theme["fg"], font=(self.font_family, font_size))
                text_widget.tag_configure("h1", font=content_font_h1, foreground=theme["header_fg"])
                text_widget.tag_configure("h2", font=content_font_h2, foreground=theme["header_fg"])
                text_widget.tag_configure("bold", font=content_font_bold)
                text_widget.tag_configure("pass", foreground="#3CB371")
                text_widget.tag_configure("warn", foreground="#FFA500")

    def update_font_from_slider(self, *args):
        self.apply_theme_and_font()

    def change_font_size(self, delta):
        new_size = self.font_size_var.get() + delta
        if 8 <= new_size <= 20:
            self.font_size_var.set(new_size)

    def create_widgets(self):
        control_bar = ttk.Frame(self.root, padding=(10, 5))
        control_bar.pack(fill='x')
        ttk.Button(control_bar, text="Readme & Links", command=self.show_readme).pack(side='left')
        ttk.Checkbutton(control_bar, text="Dark Mode", variable=self.is_dark_mode, command=self.apply_theme_and_font).pack(side='left', padx=20)
        
        font_frame = ttk.Frame(control_bar)
        font_frame.pack(side='left', padx=20)
        ttk.Label(font_frame, text="Content Font Size:", style='Control.TLabel').pack(side='left', padx=(0, 5))
        ttk.Button(font_frame, text="-", command=lambda: self.change_font_size(-1), width=2).pack(side='left')
        ttk.Scale(font_frame, from_=8, to=20, variable=self.font_size_var, orient='horizontal').pack(side='left', padx=5)
        ttk.Button(font_frame, text="+", command=lambda: self.change_font_size(1), width=2).pack(side='left')

        notebook = ttk.Notebook(self.root, padding=10)
        notebook.pack(fill="both", expand=True)
        calc_frame = ttk.Frame(notebook)
        instr_frame = ttk.Frame(notebook)
        notebook.add(calc_frame, text='Loss Calculator')
        notebook.add(instr_frame, text='OTDR Guide')
        
        self.create_calculator_tab(calc_frame)
        self.create_instructions_tab(instr_frame)
    
    def create_calculator_tab(self, parent):
        parent.grid_columnconfigure(1, weight=1)
        parent.grid_rowconfigure(0, weight=1)
        
        input_frame = ttk.LabelFrame(parent, text="Input Parameters", padding=10)
        input_frame.grid(row=0, column=0, padx=10, sticky="nsew")

        self.input_labels = [] # To hold labels that need font resizing
        
        label1 = ttk.Label(input_frame, text="Fiber Type:")
        label1.grid(row=0, column=0, sticky="w", pady=4)
        self.fiber_type_var = tk.StringVar(value="OS2")
        ttk.Combobox(input_frame, textvariable=self.fiber_type_var, values=list(FIBER_STANDARDS.keys()), state="readonly").grid(row=0, column=1, sticky="ew", pady=4)

        label2 = ttk.Label(input_frame, text="Distance (meters):")
        label2.grid(row=1, column=0, sticky="w", pady=4)
        self.distance_var = tk.StringVar()
        self.distance_entry = ttk.Entry(input_frame, textvariable=self.distance_var)
        self.distance_entry.grid(row=1, column=1, sticky="ew", pady=4)

        label3 = ttk.Label(input_frame, text="Splice Count:")
        label3.grid(row=2, column=0, sticky="w", pady=4)
        self.splice_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.splice_var).grid(row=2, column=1, sticky="ew", pady=4)

        label4 = ttk.Label(input_frame, text="Connector Count:")
        label4.grid(row=3, column=0, sticky="w", pady=4)
        self.connector_var = tk.StringVar()
        ttk.Entry(input_frame, textvariable=self.connector_var).grid(row=3, column=1, sticky="ew", pady=4)

        self.input_labels.extend([label1, label2, label3, label4])

        btn_frame = ttk.Frame(input_frame)
        btn_frame.grid(row=4, column=0, columnspan=2, pady=20)
        ttk.Button(btn_frame, text="Calculate", command=self.calculate_and_display).pack(side='left', padx=5)
        ttk.Button(btn_frame, text="Clear", command=self.clear_fields).pack(side='left', padx=5)

        output_frame = ttk.LabelFrame(parent, text="Results", padding=10)
        output_frame.grid(row=0, column=1, sticky="nsew", padx=10)
        self.calc_output_text = ScrolledText(output_frame, wrap=tk.WORD, height=10)
        self.calc_output_text.pack(fill="both", expand=True)

    def create_instructions_tab(self, parent):
        parent.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(1, weight=1)
        self.otdr_image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "otdr_example.png")

        if PIL_AVAILABLE:
            img_frame = ttk.LabelFrame(parent, text="Example OTDR Trace (Click to Open)", padding=10)
            img_frame.grid(row=0, column=0, pady=10, sticky="ew")
            self.img_label = ttk.Label(img_frame, cursor="hand2")
            self.img_label.pack()
            self.img_label.bind("<Button-1>", self.open_otdr_image)
            try:
                img = Image.open(self.otdr_image_path).resize((600, 200), Image.LANCZOS)
                self.otdr_photo = ImageTk.PhotoImage(img)
                self.img_label.config(image=self.otdr_photo)
            except FileNotFoundError:
                self.img_label.config(text="Place 'otdr_example.png' in the same folder to display it here.")
        
        text_frame = ttk.LabelFrame(parent, text="How to Read the Report", padding=10)
        text_frame.grid(row=1, column=0, sticky="nsew")
        self.instr_text = ScrolledText(text_frame, wrap=tk.WORD)
        self.instr_text.pack(fill="both", expand=True)
        self.populate_instructions()
            
    def open_otdr_image(self, event=None):
        try:
            os.startfile(self.otdr_image_path)
        except AttributeError:
            webbrowser.open(f"file://{os.path.realpath(self.otdr_image_path)}")
        except FileNotFoundError:
            messagebox.showerror("File Not Found", f"Could not find the image file at:\n{self.otdr_image_path}")
            
    def populate_instructions(self):
        self.instr_text.config(state='normal')
        self.instr_text.delete('1.0', tk.END)
        self.instr_text.insert(tk.END, "Reading an OTDR Trace: A Step-by-Step Guide\n\n", "h1")
        self.instr_text.insert(tk.END, "Which Wavelength Report to Use?\n", "h2")
        self.instr_text.insert(tk.END, "▪ Single-Mode (OS2): ", "bold")
        self.instr_text.insert(tk.END, "Always use the 1550nm report as your reference. It is more sensitive to bends and losses, giving you the most accurate splice count for your budget.\n")
        self.instr_text.insert(tk.END, "▪ Multi-Mode (OMx): ", "bold")
        self.instr_text.insert(tk.END, "Use the 850nm report. This is the primary transmission wavelength and its higher natural loss provides a 'worst-case' scenario for a safe, conservative budget.\n\n")
        self.instr_text.insert(tk.END, "Key Features to Identify (using an OS2 1550nm report as an example):\n\n", "h2")
        self.instr_text.insert(tk.END, "1. Fusion Splices (e.g., Event 3 at 2820.13m)\n", "bold")
        self.instr_text.insert(tk.END, "A small, sharp drop with no reflection. A loss of <0.1 dB (like 0.042 dB) is a high-quality splice.\n\n")
        self.instr_text.insert(tk.END, "2. End of Fiber (e.g., Event 8 at 7822.36m)\n", "bold")
        self.instr_text.insert(tk.END, "The final event is a large reflective spike, marking the end of the line.\n")
        self.instr_text.config(state='disabled')
        
    def show_readme(self):
        readme_win = tk.Toplevel(self.root)
        readme_win.title("Readme & Standards Information")
        readme_win.geometry("650x500")
        text = ScrolledText(readme_win, wrap=tk.WORD, font=(self.font_family, 10))
        text.pack(expand=True, fill="both", padx=10, pady=10)

        theme = self.dark_theme if self.is_dark_mode.get() else self.light_theme
        text.config(bg=theme["text_bg"], fg=theme["fg"])
        link_color = theme["link_fg"]
        text.tag_configure("h1", font=(self.font_family, 12, 'bold'), foreground=theme["header_fg"])
        text.tag_configure("h2", font=(self.font_family, 11, 'bold'))
        
        links = {
            "itu_link": "https://www.itu.int/rec/T-REC-G.652",
            "tia_link": "https://www.tiaonline.org/products-and-services/standards/",
            "iso_link": "https://www.iso.org/committee/45838.html",
            "fs_loss_link": "https://www.fs.com/blog/understanding-fiber-loss-what-is-it-and-how-to-calculate-it-3792.html",
            "fs_types_link": "https://www.fs.com/blog/fiber-optic-cable-types-single-mode-vs-multimode-fiber-cable-1310.html"
        }

        def add_hyperlink(widget, text_to_display, url_key):
            tag_name = f"link_{url_key}"
            widget.tag_configure(tag_name, foreground=link_color, underline=True)
            widget.tag_bind(tag_name, "<Enter>", lambda e: widget.config(cursor="hand2"))
            widget.tag_bind(tag_name, "<Leave>", lambda e: widget.config(cursor=""))
            widget.tag_bind(tag_name, "<Button-1>", lambda e, url=links[url_key]: webbrowser.open(url))
            widget.insert(tk.END, text_to_display, tag_name)

        text.insert(tk.END, "Standards & References\n\n", "h1")
        text.insert(tk.END, "This calculator uses parameters from major industry standards.\n\n")
        
        text.insert(tk.END, "Official Standards\n", "h2")
        text.insert(tk.END, "▪ ITU-T G.652: Defines attenuation (dB/km) for single-mode fiber.\n  ")
        add_hyperlink(text, "View Standard", "itu_link")
        text.insert(tk.END, "\n\n▪ TIA-568 Series: Sets max loss for connectors (0.75 dB) and splices (0.3 dB).\n  ")
        add_hyperlink(text, "View Publisher", "tia_link")
        text.insert(tk.END, "\n\n▪ ISO/IEC 11801: The international equivalent of TIA-568.\n  ")
        add_hyperlink(text, "View Committee", "iso_link")
        
        text.insert(tk.END, "\n\n\nAdditional Learning Resources\n", "h2")
        text.insert(tk.END, "▪ Understanding Fiber Loss Calculation\n  ")
        add_hyperlink(text, "Read on FS.com", "fs_loss_link")
        text.insert(tk.END, "\n\n▪ Single-Mode vs. Multi-Mode Fiber Types\n  ")
        add_hyperlink(text, "Read on FS.com", "fs_types_link")

        text.config(state="disabled")

    def calculate_and_display(self):
        try:
            fiber_type = self.fiber_type_var.get()
            params = FIBER_STANDARDS[fiber_type]
            distance_m = float(self.distance_var.get())
            splice_count = int(self.splice_var.get())
            connector_count = int(self.connector_var.get())
            
            max_dist = params['max_distance_m']
            if distance_m > max_dist:
                messagebox.showerror("Length Error", f"The entered distance of {distance_m}m exceeds the recommended maximum of {max_dist}m for {fiber_type}.\n\nPlease enter a valid length to perform the calculation.")
                return

            self.calc_output_text.config(state='normal')
            self.calc_output_text.delete('1.0', tk.END)
            self.calc_output_text.insert(tk.END, "📊 Link Loss Budget Results\n\n", "h1")
            self.calc_output_text.insert(tk.END, "Fiber Type: ", "bold")
            self.calc_output_text.insert(tk.END, f"{params['name']}\n")
            separator = "--------------------------------------------------------\n"
            self.calc_output_text.insert(tk.END, separator)

            for wl, atten in params['wavelengths'].items():
                max_loss = (distance_m / 1000 * atten['max_attenuation_db_km']) + (splice_count * params['splice_loss']['max_db']) + (connector_count * params['connector_loss']['max_db'])
                typ_loss = (distance_m / 1000 * atten['typical_attenuation_db_km']) + (splice_count * params['splice_loss']['typical_db']) + (connector_count * params['connector_loss']['typical_db'])
                self.calc_output_text.insert(tk.END, f"📈 Results for Wavelength: {wl}\n", "h2")
                self.calc_output_text.insert(tk.END, "  - Highest Acceptable Loss: ", "bold")
                self.calc_output_text.insert(tk.END, f"{max_loss:.2f} dB\n", "pass")
                self.calc_output_text.insert(tk.END, "  - Typical Good Performance: ", "bold")
                self.calc_output_text.insert(tk.END, f"{typ_loss:.2f} dB\n")
                self.calc_output_text.insert(tk.END, separator)
            self.calc_output_text.config(state='disabled')

        except ValueError:
            messagebox.showerror("Input Error", "Please enter valid numbers for distance, splices, and connectors.")

    def clear_fields(self):
        self.distance_var.set("")
        self.splice_var.set("")
        self.connector_var.set("")
        self.calc_output_text.config(state='normal')
        self.calc_output_text.delete("1.0", tk.END)
        self.calc_output_text.config(state='disabled')
        self.distance_entry.focus()


if __name__ == "__main__":
    if not PIL_AVAILABLE:
        messagebox.showwarning("Missing Dependency", "The 'Pillow' library is not installed.\nImage display will be disabled.\n\nInstall it by running: pip install Pillow")
    root = tk.Tk()
    app = LossCalculatorApp(root)
    root.mainloop()