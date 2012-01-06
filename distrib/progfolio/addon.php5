<?php

  /*
   * addon.php5
   * ----------
   * 
   * Minus Cube
   * Copyright (c) 2005-2011 Laurent Couvidou
   * Contact: lorancou@free.fr
   * 
   * This program is free software - see README for details.
   */

echoFlat('<div><canvas id="main" width="120" height="120"></canvas></div>');

$commandDiv = new UniqueDivision( "test", "command" );
$commandDiv->begin();
$scramble = 'Scramble';
$or = 'or';
$solve = 'solve';
if (Progfolio::instance()->language == Progfolio::FRENCH)
{
    $scramble = 'Mélanger';
    $ou = 'ou';
    $solve = 'résoudre';
}
echoFlat(
    '<a class="command" onclick="minus_input_scramble();">'.$scramble.'</a> '.
    $or.
    ' <a class="command" onclick="minus_input_solve();">'.$solve.'</a>'
    );
$commandDiv->end();

$linkDiv = new Division();
$linkDiv->begin();
$logo = new Logo( Logo::INFO, "?page=project&id-unix=minus" );
$logo->display();
$link = new Link( KNOW_MORE, "?page=project&id-unix=minus" );
$link->display();
$linkDiv->end();

?>