.PHONY: all en cn clean help

all: en cn

en: robotpu-brochure.pdf

cn: robotpu-brochure-cn.pdf

robotpu-brochure.pdf: robotpu-brochure.tex
	pdflatex -interaction=nonstopmode robotpu-brochure.tex
	pdflatex -interaction=nonstopmode robotpu-brochure.tex

robotpu-brochure-cn.pdf: robotpu-brochure-cn.tex
	xelatex -interaction=nonstopmode robotpu-brochure-cn.tex
	xelatex -interaction=nonstopmode robotpu-brochure-cn.tex

clean:
	rm -f *.aux *.log *.out *.toc *.synctex.gz

help:
	@echo "Available targets:"
	@echo "  make all  - compile both English and Chinese brochures"
	@echo "  make en   - compile English brochure (pdflatex)"
	@echo "  make cn   - compile Chinese brochure  (xelatex)"
	@echo "  make clean - remove LaTeX auxiliary files"
