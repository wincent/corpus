#!/bin/sh

set -e

if tmux has-session -t corpus 2> /dev/null; then
  tmux attach -t corpus
  exit
fi

# Window 1, left pane: vim.
tmux new-session -d -s corpus -n vim -x $(tput cols) -y $(tput lines)
$(sleep 2; tmux send-keys -t corpus:vim "vim -c CommandT" Enter) &

# Window 1, (top) right pane: gulp
tmux split-window -t corpus:vim -h
tmux send-keys -t corpus:vim.right "yarn run gulp" Enter

# Window 1, bottom right pane: shell.
tmux split-window -t corpus:vim.2
tmux send-keys -t corpus:vim.bottom-right "git st" Enter

tmux attach -t corpus:vim.left
